#!/usr/bin/env node
import { randomBytes, scryptSync } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import prompts from "prompts";

const args = process.argv.slice(2);
const parsed = parseArgs(args);
const cmd = parsed.command;

if (parsed.flags.help || cmd === "help") {
  printHelp();
  process.exit(0);
}

if (parsed.flags.version) {
  console.log("openclaw-manager 0.1.0");
  process.exit(0);
}

if (!cmd) {
  printWelcome();
  process.exit(0);
}

if (cmd === "start") {
  void start(parsed.flags);
} else if (cmd === "stop") {
  void stop(parsed.flags);
} else if (cmd === "stop-all") {
  void stopAll(parsed.flags);
} else {
  console.error(`[manager] Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

async function start(flags) {
  const apiPort = String(flags.apiPort ?? process.env.MANAGER_API_PORT ?? "17321");
  const apiHost = flags.apiHost ?? process.env.MANAGER_API_HOST ?? "0.0.0.0";
  const configDir =
    flags.configDir ??
    process.env.MANAGER_CONFIG_DIR ??
    path.join(os.homedir(), ".openclaw-manager");
  const configPath =
    flags.configPath ??
    process.env.MANAGER_CONFIG_PATH ??
    path.join(configDir, "config.json");
  const logPath =
    flags.logPath ??
    process.env.MANAGER_LOG_PATH ??
    path.join(configDir, "openclaw-manager.log");
  const errorLogPath =
    flags.errorLogPath ??
    process.env.MANAGER_ERROR_LOG_PATH ??
    path.join(configDir, "openclaw-manager.error.log");
  const pidPath = path.join(configDir, "manager.pid");

  ensureDir(configDir);
  ensureDir(path.dirname(logPath));
  ensureDir(path.dirname(errorLogPath));

  if (isRunning(pidPath)) {
    const pid = fs.readFileSync(pidPath, "utf-8").trim();
    console.log(`[manager] Already running (pid: ${pid}).`);
    return;
  }

  const explicitUser = normalizeString(
    flags.user ??
      flags.username ??
      process.env.MANAGER_ADMIN_USER ??
      process.env.OPENCLAW_MANAGER_ADMIN_USER
  );
  const explicitPass = normalizeString(
    flags.pass ??
      flags.password ??
      process.env.MANAGER_ADMIN_PASS ??
      process.env.OPENCLAW_MANAGER_ADMIN_PASS
  );
  const hasConfig = hasAdminConfig(configPath);
  if (explicitUser || explicitPass) {
    if (!explicitUser || !explicitPass) {
      console.error("[manager] Both --user and --password are required when overriding admin config.");
      process.exit(1);
    }
    writeAdminConfig(configPath, explicitUser, explicitPass);
  } else if (!hasConfig) {
    if (flags.nonInteractive || !process.stdin.isTTY) {
      console.error("[manager] Admin username/password is required. Use --user/--password.");
      process.exit(1);
    }
    const response = await prompts(
      [
        {
          type: "text",
          name: "username",
          message: "Admin username",
          validate: (value) => (value ? true : "Username is required")
        },
        {
          type: "password",
          name: "password",
          message: "Admin password",
          validate: (value) => (value ? true : "Password is required")
        }
      ],
      {
        onCancel: () => {
          throw new Error("Prompt cancelled");
        }
      }
    );
    const username = String(response.username ?? "").trim();
    const password = String(response.password ?? "").trim();
    if (!username || !password) {
      console.error("[manager] Admin username/password is required.");
      process.exit(1);
    }
    writeAdminConfig(configPath, username, password);
  }

  const pkgRoot = resolvePackageRoot();
  const apiEntry = path.join(pkgRoot, "dist", "index.js");
  const webDist = path.join(pkgRoot, "web-dist");

  if (!fs.existsSync(apiEntry) || !fs.existsSync(webDist)) {
    console.error("[manager] Package is missing build artifacts.");
    console.error("[manager] Please reinstall or use a release that includes dist assets.");
    process.exit(1);
  }

  const out = fs.openSync(logPath, "a");
  const err = fs.openSync(errorLogPath, "a");
  const child = spawn(process.execPath, [apiEntry], {
    env: {
      ...process.env,
      MANAGER_API_HOST: apiHost,
      MANAGER_API_PORT: apiPort,
      MANAGER_WEB_DIST: webDist,
      MANAGER_CONFIG_PATH: configPath
    },
    detached: true,
    stdio: ["ignore", out, err]
  });
  child.unref();

  fs.writeFileSync(pidPath, String(child.pid), "utf-8");

  const lanIp = resolveLanIp();
  console.log(`[manager] Started (pid: ${child.pid}).`);
  console.log(`[manager] Log: ${logPath}`);
  console.log(`[manager] Error log: ${errorLogPath}`);
  console.log(`[manager] Open (local): http://localhost:${apiPort}`);
  console.log(`[manager] Open (local): http://127.0.0.1:${apiPort}`);
  if (lanIp) {
    console.log(`[manager] Open (LAN): http://${lanIp}:${apiPort}`);
  }
}

async function stop(flags) {
  const results = stopManagerProcess({ flags });
  for (const line of results.messages) {
    console.log(line);
  }
  if (!results.ok) process.exit(1);
}

async function stopAll(flags) {
  const results = stopAllProcesses({ flags });
  for (const line of results.messages) {
    console.log(line);
  }
  if (!results.ok) process.exit(1);
}

function ensureDir(dir) {
  if (!dir) return;
  fs.mkdirSync(dir, { recursive: true });
}

function isRunning(pidPath) {
  if (!fs.existsSync(pidPath)) return false;
  const raw = fs.readFileSync(pidPath, "utf-8").trim();
  const pid = Number(raw);
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function writeAdminConfig(configPath, username, password) {
  const salt = randomBytes(16).toString("base64");
  const hash = scryptSync(password, salt, 64).toString("base64");
  const payload = {
    auth: {
      username,
      salt,
      hash
    },
    createdAt: new Date().toISOString()
  };
  ensureDir(path.dirname(configPath));
  fs.writeFileSync(configPath, JSON.stringify(payload, null, 2));
  console.log(`[manager] Admin config saved to ${configPath}`);
}

function resolveLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

function resolvePackageRoot() {
  const filePath = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(filePath), "..");
}

function hasAdminConfig(configPath) {
  if (!fs.existsSync(configPath)) return false;
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    return Boolean(
      parsed &&
        parsed.auth &&
        typeof parsed.auth.username === "string" &&
        typeof parsed.auth.salt === "string" &&
        typeof parsed.auth.hash === "string"
    );
  } catch {
    return false;
  }
}

function stopManagerProcess({ flags }) {
  const messages = [];
  const errors = [];
  const candidates = resolveConfigDirCandidates(flags);
  let stopped = false;

  if (process.platform !== "win32" && commandExists("systemctl")) {
    const serviceName = "clawdbot-manager";
    const servicePath = `/etc/systemd/system/${serviceName}.service`;
    if (fs.existsSync(servicePath)) {
      const result = spawnSync("systemctl", ["stop", serviceName], { encoding: "utf-8" });
      if (result.status === 0) {
        messages.push("manager: stopped systemd service");
        stopped = true;
      }
    }
  }

  for (const configDir of candidates) {
    const pidPath = path.join(configDir, "manager.pid");
    if (!fs.existsSync(pidPath)) continue;
    const pid = readPid(pidPath);
    if (!pid) continue;
    try {
      process.kill(pid, "SIGTERM");
      fs.rmSync(pidPath, { force: true });
      messages.push(`manager: stopped pid ${pid}`);
      stopped = true;
    } catch (err) {
      errors.push(`manager: failed to stop pid ${pid}: ${String(err)}`);
    }
  }

  if (!stopped) {
    const port = Number(flags.apiPort ?? process.env.MANAGER_API_PORT ?? 17321);
    const pids = findListeningPids(port);
    if (pids.length) {
      for (const pid of pids) {
        try {
          process.kill(pid, "SIGTERM");
        } catch (err) {
          errors.push(`manager: failed to stop pid ${pid}: ${String(err)}`);
        }
      }
      messages.push(`manager: stopped port ${port} (pids: ${pids.join(", ")})`);
      stopped = true;
    }
  }

  if (!stopped && !errors.length) {
    messages.push("manager: not running");
  }

  if (errors.length) {
    return { ok: false, messages, error: errors.join("; ") };
  }
  return { ok: true, messages };
}

function stopAllProcesses({ flags }) {
  const messages = [];
  const errors = [];

  const managerResult = stopManagerProcess({ flags });
  messages.push(...managerResult.messages);
  if (!managerResult.ok) errors.push(managerResult.error ?? "manager stop failed");

  const sandboxes = listSandboxInstances();
  if (!sandboxes.length) {
    messages.push("sandbox: none");
  } else {
    for (const sandbox of sandboxes) {
      const result = stopSandboxDir(sandbox);
      if (result.ok) {
        messages.push(`sandbox: ${result.message}`);
      } else {
        errors.push(`sandbox: ${result.error ?? "stop failed"}`);
      }
    }
  }

  const gatewayResult = stopGatewayProcesses();
  messages.push(gatewayResult.message);
  if (!gatewayResult.ok) errors.push(gatewayResult.error ?? "gateway stop failed");

  if (errors.length) {
    return { ok: false, messages, error: errors.join("; ") };
  }
  return { ok: true, messages };
}

function resolveConfigDirCandidates(flags) {
  const explicit = flags.configDir ?? process.env.MANAGER_CONFIG_DIR;
  if (explicit) return [explicit];
  return [
    path.join(os.homedir(), ".openclaw-manager"),
    path.join(os.homedir(), ".clawdbot-manager")
  ];
}

function listSandboxInstances() {
  const dir = os.tmpdir();
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => {
      return (
        entry.isDirectory() &&
        (entry.name.startsWith("openclaw-manager-sandbox-") ||
          entry.name.startsWith("clawdbot-manager-sandbox-"))
      );
    })
    .map((entry) => path.join(dir, entry.name));
}

function stopSandboxDir(rootDir) {
  const pidFile = path.join(rootDir, "manager-api.pid");
  if (!fs.existsSync(pidFile)) {
    return { ok: true, message: `already stopped (${rootDir})` };
  }
  const pid = readPid(pidFile);
  if (!pid) {
    return { ok: true, message: `pid invalid (${rootDir})` };
  }
  try {
    process.kill(pid, "SIGTERM");
    return { ok: true, message: `stopped pid ${pid}` };
  } catch (err) {
    return { ok: false, error: `failed to stop pid ${pid}: ${String(err)}` };
  }
}

function stopGatewayProcesses() {
  if (process.platform === "win32" || !commandExists("pgrep")) {
    return { ok: true, message: "gateway: skipped" };
  }
  const result = spawnSync("pgrep", ["-fl", "clawdbot-gateway"], { encoding: "utf-8" });
  if (result.error || result.status !== 0) {
    return { ok: true, message: "gateway: none" };
  }
  const lines = String(result.stdout)
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const pids = lines
    .map((line) => Number(line.split(/\s+/)[0]))
    .filter((pid) => Number.isFinite(pid) && pid > 0);
  if (!pids.length) {
    return { ok: true, message: "gateway: none" };
  }
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // ignore individual failures; report below
    }
  }
  return { ok: true, message: `gateway: stopped (${pids.join(", ")})` };
}

function findListeningPids(port) {
  if (process.platform === "win32" || !commandExists("lsof")) return [];
  const result = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], {
    encoding: "utf-8"
  });
  if (result.error || result.status !== 0) return [];
  return String(result.stdout)
    .split(/\s+/)
    .map((value) => Number(value.trim()))
    .filter((pid) => Number.isFinite(pid) && pid > 0);
}

function readPid(pidPath) {
  try {
    const raw = fs.readFileSync(pidPath, "utf-8").trim();
    const pid = Number(raw);
    if (!Number.isFinite(pid) || pid <= 0) return null;
    return pid;
  } catch {
    return null;
  }
}

function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function commandExists(cmd) {
  const result = spawnSync("command", ["-v", cmd], { encoding: "utf-8", shell: true });
  return result.status === 0;
}

function parseArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--") {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const [keyRaw, inlineValue] = arg.slice(2).split("=");
      const key = normalizeFlagKey(keyRaw);
      if (key === "help") flags.help = true;
      else if (key === "version") flags.version = true;
      else if (inlineValue !== undefined) flags[key] = inlineValue;
      else if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        flags[key] = argv[i + 1];
        i += 1;
      } else {
        flags[key] = true;
      }
      continue;
    }
    if (arg.startsWith("-") && arg.length > 1) {
      const shorts = arg.slice(1).split("");
      for (const short of shorts) {
        if (short === "h") flags.help = true;
        else if (short === "v") flags.version = true;
        else if (short === "u") flags.user = argv[i + 1] && !argv[i + 1].startsWith("-") ? argv[++i] : true;
        else if (short === "p") flags.pass = argv[i + 1] && !argv[i + 1].startsWith("-") ? argv[++i] : true;
        else flags[short] = true;
      }
      continue;
    }
    positionals.push(arg);
  }

  return { command: positionals[0] ?? "", flags };
}

function normalizeFlagKey(key) {
  if (!key) return "";
  if (key === "config-dir") return "configDir";
  if (key === "config-path") return "configPath";
  if (key === "log-path") return "logPath";
  if (key === "error-log-path") return "errorLogPath";
  if (key === "api-port") return "apiPort";
  if (key === "api-host") return "apiHost";
  if (key === "non-interactive") return "nonInteractive";
  if (key === "user" || key === "username") return "user";
  if (key === "pass" || key === "password") return "pass";
  return key;
}

function printHelp() {
  console.log(
    `openclaw-manager\n\nUsage:\n  openclaw-manager <command> [options]\n\nCommands:\n  start     Start OpenClaw Manager\n  stop      Stop the running Manager process\n  stop-all  Stop Manager, sandboxes, and gateway processes\n\nOptions:\n  -h, --help            Show help\n  -v, --version         Show version\n  -u, --user <name>     Admin username (start)\n  -p, --pass <value>    Admin password (start)\n  --non-interactive     Fail instead of prompting for credentials\n  --api-port <port>     API port (default: 17321)\n  --api-host <host>     API host (default: 0.0.0.0)\n  --config-dir <dir>    Config directory\n  --config-path <path>  Config file path\n`
  );
}

function printWelcome() {
  console.log(
    `OpenClaw Manager\n\n最快开始：\n  openclaw-manager start\n\n常用命令：\n  openclaw-manager stop\n  openclaw-manager stop-all\n\n提示：首次启动会要求设置管理员账号密码。\n文档： https://openclaw-manager.com\n`
  );
}
