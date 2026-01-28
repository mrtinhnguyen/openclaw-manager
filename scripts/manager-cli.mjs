#!/usr/bin/env node
import process from "node:process";

const args = process.argv.slice(2);
const cmd = args[0];
const { flags } = parseArgs(args.slice(1));

if (!cmd || cmd === "help" || flags.help) {
  printHelp();
  process.exit(0);
}

const apiBase = resolveApiBase(flags);
const auth = resolveAuth(flags);
const nonInteractive = isNonInteractive(flags);

try {
  if (cmd === "status") {
    const query = buildQuery({
      gatewayHost: flags["gateway-host"],
      gatewayPort: flags["gateway-port"]
    });
    const data = await requestJson("GET", `${apiBase}/api/status${query}`, null, auth);
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  }

  if (cmd === "apply") {
    const configPath = flags.config ?? flags.c ?? "manager.toml";
    const config = await loadTomlConfig(configPath);
    const apiFromConfig = resolveApiBaseFromConfig(config);
    const authFromConfig = resolveAuthFromConfig(config);
    const targetApi = apiFromConfig ?? apiBase;
    const targetAuth = authFromConfig ?? auth;
    await applyConfig(config, targetApi, targetAuth, { nonInteractive });
    process.exit(0);
  }

  if (cmd === "login") {
    const user = flags.user ?? flags.username;
    const pass = flags.pass ?? flags.password;
    if (!user || !pass) {
      throw new Error("missing --user/--pass");
    }
    const data = await requestJson("POST", `${apiBase}/api/auth/login`, { username: user, password: pass }, null);
    if (!data.ok) {
      throw new Error(data.error ?? "login failed");
    }
    console.log("login ok");
    if (flags["print-auth"]) {
      console.log(buildBasicAuth(user, pass));
    }
    process.exit(0);
  }

  if (cmd === "quickstart") {
    const payload = {
      startGateway: flags["start-gateway"] !== false,
      runProbe: Boolean(flags["run-probe"])
    };
    await runJob(`${apiBase}/api/jobs/quickstart`, payload, auth);
    process.exit(0);
  }

  if (cmd === "probe") {
    const payload = {
      startGateway: flags["start-gateway"] !== false,
      runProbe: true
    };
    await runJob(`${apiBase}/api/jobs/quickstart`, payload, auth);
    process.exit(0);
  }

  if (cmd === "discord-token") {
    const token = flags.token ?? flags.t;
    if (!token) throw new Error("missing --token");
    const data = await requestJson(
      "POST",
      `${apiBase}/api/discord/token`,
      { token },
      auth
    );
    if (!data.ok) throw new Error(data.error ?? "discord token failed");
    console.log("discord token saved");
    process.exit(0);
  }

  if (cmd === "ai-auth") {
    const provider = flags.provider ?? flags.p;
    const apiKey = flags.key ?? flags.k;
    if (!provider || !apiKey) throw new Error("missing --provider/--key");
    await runJob(`${apiBase}/api/jobs/ai/auth`, { provider, apiKey }, auth);
    process.exit(0);
  }

  if (cmd === "pairing-approve") {
    const code = flags.code ?? flags.c;
    if (!code) throw new Error("missing --code");
    await runJob(`${apiBase}/api/jobs/discord/pairing`, { code }, auth);
    process.exit(0);
  }

  if (cmd === "pairing-prompt") {
    ensureInteractive(nonInteractive);
    const code = await promptForInput("请输入配对码并回车确认（留空取消）：");
    if (!code) throw new Error("missing pairing code");
    await runJob(`${apiBase}/api/jobs/discord/pairing`, { code }, auth);
    process.exit(0);
  }

  if (cmd === "pairing-wait") {
    const timeoutMs = parseNumberFlag(flags.timeout ?? flags["timeout-ms"]);
    const pollMs = parseNumberFlag(flags.poll ?? flags["poll-ms"]);
    const notify = Boolean(flags.notify);
    const payload = {};
    if (timeoutMs) payload.timeoutMs = timeoutMs;
    if (pollMs) payload.pollMs = pollMs;
    if (notify) payload.notify = true;
    await runJob(`${apiBase}/api/jobs/discord/pairing/wait`, payload, auth);
    process.exit(0);
  }

  if (cmd === "gateway-start") {
    const data = await requestJson(
      "POST",
      `${apiBase}/api/processes/start`,
      { id: "gateway-run" },
      auth
    );
    if (!data.ok) throw new Error(data.error ?? "gateway start failed");
    console.log("gateway start requested");
    process.exit(0);
  }

  throw new Error(`unknown command: ${cmd}`);
} catch (err) {
  console.error(formatError(err));
  process.exit(1);
}

function parseArgs(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const raw = arg.slice(2);
    const [key, inlineValue] = raw.split("=", 2);
    if (key.startsWith("no-")) {
      flags[key.slice(3)] = false;
      continue;
    }
    if (inlineValue !== undefined) {
      flags[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }
    flags[key] = next;
    i += 1;
  }
  return { flags };
}

function resolveApiBase(flags) {
  const envBase = process.env.MANAGER_API_URL ?? process.env.MANAGER_API_BASE;
  const port = process.env.MANAGER_API_PORT ?? "17321";
  const base =
    flags.api ?? flags["api-base"] ?? envBase ?? `http://127.0.0.1:${port}`;
  return base.replace(/\/+$/, "");
}

function resolveApiBaseFromConfig(config) {
  const api = config?.api ?? {};
  const base = api.base ?? api.url;
  if (!base || typeof base !== "string") return null;
  return base.replace(/\/+$/, "");
}

function resolveAuth(flags) {
  const user =
    flags.user ??
    flags.username ??
    process.env.MANAGER_AUTH_USER ??
    process.env.MANAGER_ADMIN_USER ??
    "";
  const pass =
    flags.pass ??
    flags.password ??
    process.env.MANAGER_AUTH_PASS ??
    process.env.MANAGER_ADMIN_PASS ??
    "";
  if (!user || !pass) return null;
  return buildBasicAuth(user, pass);
}

function resolveAuthFromConfig(config) {
  const admin = config?.admin ?? {};
  const user = typeof admin.user === "string" ? admin.user : "";
  const pass = typeof admin.pass === "string" ? admin.pass : "";
  if (!user || !pass) return null;
  return buildBasicAuth(user, pass);
}

function buildQuery(params) {
  const entries = Object.entries(params).filter(([, value]) => Boolean(value));
  if (!entries.length) return "";
  const search = new URLSearchParams();
  for (const [key, value] of entries) {
    search.set(key, String(value));
  }
  return `?${search.toString()}`;
}

function buildBasicAuth(user, pass) {
  const raw = `${user}:${pass}`;
  const encoded = Buffer.from(raw, "utf-8").toString("base64");
  return `Basic ${encoded}`;
}

async function requestJson(method, url, body, authHeader) {
  const res = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...(authHeader ? { authorization: authHeader } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`request failed: ${res.status} ${text}`.trim());
  }
  return res.json();
}

async function runJob(url, payload, authHeader) {
  const res = await requestJson("POST", url, payload, authHeader);
  if (!res.ok || !res.jobId) {
    throw new Error(res.error ?? "job create failed");
  }
  const base = url.replace(/\/api\/jobs\/.+$/, "");
  await streamJob(`${base}/api/jobs/${res.jobId}/stream`, authHeader);
}

async function streamJob(url, authHeader) {
  const res = await fetch(url, {
    headers: authHeader ? { authorization: authHeader } : {}
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`stream failed: ${res.status} ${text}`.trim());
  }
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  let event = { type: null, data: "" };
  let failed = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) {
        if (event.type && event.data) {
          try {
            const parsed = JSON.parse(event.data);
            if (event.type === "log" && parsed?.message) {
              console.log(parsed.message);
            }
            if (event.type === "status") {
              console.log(`status: ${parsed?.status ?? "unknown"}`);
              if (parsed?.status === "failed") failed = true;
            }
            if (event.type === "error") {
              console.error(parsed?.error ?? "job error");
              failed = true;
            }
            if (event.type === "done") {
              console.log("done");
            }
          } catch (err) {
            console.error(`invalid event: ${event.data}`);
          }
        }
        event = { type: null, data: "" };
        continue;
      }
      if (line.startsWith("event:")) {
        event.type = line.slice("event:".length).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        event.data = line.slice("data:".length).trim();
      }
    }
  }
  if (failed) {
    throw new Error("job failed");
  }
}

function formatError(err) {
  if (err instanceof Error) return err.message;
  return String(err);
}

function printHelp() {
  console.log(`clawdbot-manager CLI

Usage:
  node scripts/manager-cli.mjs <command> [--flags]

Commands:
  status                  Show status snapshot
  apply                   Run steps from a TOML config
  login                   Verify login (use --user/--pass)
  quickstart              Start gateway (optional --run-probe)
  probe                   Run probe (defaults to start gateway)
  discord-token           Save Discord bot token
  ai-auth                 Save AI provider key
  pairing-approve         Approve pairing code
  pairing-prompt          Prompt for pairing code in CLI
  pairing-wait            Wait for a pairing request and approve
  gateway-start           Start gateway process

Common flags:
  --api <base>            API base (default: http://127.0.0.1:17321)
  --user <user>           Auth username (or MANAGER_AUTH_USER)
  --pass <pass>           Auth password (or MANAGER_AUTH_PASS)
  --non-interactive       Disable prompts (or MANAGER_NON_INTERACTIVE=1)
`);
}

async function applyConfig(config, apiBaseUrl, authHeader, options) {
  console.log("apply: status");
  await requestJson("GET", `${apiBaseUrl}/api/status`, null, authHeader);

  const install = config?.install ?? {};
  const gateway = config?.gateway ?? {};
  const discord = config?.discord ?? {};
  const ai = config?.ai ?? {};
  const pairing = config?.pairing ?? {};

  const installCli = install.cli !== false;
  const startGateway = gateway.start !== false;
  const runProbe = Boolean(gateway.probe);

  if (installCli) {
    console.log("apply: install cli");
    await runJob(`${apiBaseUrl}/api/jobs/cli-install`, {}, authHeader);
  }

  if (typeof discord.token === "string" && discord.token.trim()) {
    console.log("apply: discord token");
    const data = await requestJson(
      "POST",
      `${apiBaseUrl}/api/discord/token`,
      { token: discord.token.trim() },
      authHeader
    );
    if (!data.ok) throw new Error(data.error ?? "discord token failed");
  }

  if (typeof ai.provider === "string" && typeof ai.key === "string") {
    const provider = ai.provider.trim();
    const key = ai.key.trim();
    if (provider && key) {
      console.log(`apply: ai auth (${provider})`);
      await runJob(`${apiBaseUrl}/api/jobs/ai/auth`, { provider, apiKey: key }, authHeader);
    }
  }

  if (startGateway || runProbe) {
    console.log("apply: quickstart");
    await runJob(
      `${apiBaseUrl}/api/jobs/quickstart`,
      { startGateway, runProbe },
      authHeader
    );
  }

  const pairingWait = pairing.wait === true;
  const pairingPrompt = pairing.prompt === true || pairing.manual === true;
  const pairingTimeoutMs = parseNumberFlag(pairing.timeoutMs ?? pairing.timeout);
  const pairingPollMs = parseNumberFlag(pairing.pollMs ?? pairing.poll);
  const pairingNotify = Boolean(pairing.notify);

  if (pairingPrompt) {
    console.log("apply: pairing prompt");
    ensureInteractive(options?.nonInteractive ?? false);
    const code = await promptForInput("请输入配对码并回车确认（留空取消）：");
    if (!code) {
      throw new Error("pairing code required");
    }
    await runJob(`${apiBaseUrl}/api/jobs/discord/pairing`, { code }, authHeader);
  }

  if (!pairingPrompt && pairingWait) {
    console.log("apply: pairing wait");
    const payload = {};
    if (pairingTimeoutMs) payload.timeoutMs = pairingTimeoutMs;
    if (pairingPollMs) payload.pollMs = pairingPollMs;
    if (pairingNotify) payload.notify = true;
    await runJob(`${apiBaseUrl}/api/jobs/discord/pairing/wait`, payload, authHeader);
  }

  if (!pairingPrompt && !pairingWait && Array.isArray(pairing.codes) && pairing.codes.length) {
    for (const raw of pairing.codes) {
      const code = String(raw).trim();
      if (!code) continue;
      console.log(`apply: pairing approve (${code})`);
      await runJob(`${apiBaseUrl}/api/jobs/discord/pairing`, { code }, authHeader);
    }
  }
}

function isNonInteractive(flags) {
  return (
    flags["non-interactive"] === true ||
    process.env.MANAGER_NON_INTERACTIVE === "1" ||
    process.env.CI === "1"
  );
}

function ensureInteractive(nonInteractiveFlag) {
  if (!nonInteractiveFlag) return;
  throw new Error(
    "non-interactive: pairing code required. Use pairing-approve after you get the code."
  );
}

async function promptForInput(message) {
  if (!process.stdin.isTTY) {
    throw new Error("stdin is not interactive");
  }
  const readline = await import("node:readline/promises");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(message);
    return answer.trim().toUpperCase();
  } finally {
    rl.close();
  }
}

function parseNumberFlag(value) {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

async function loadTomlConfig(configPath) {
  const fs = await import("node:fs/promises");
  const text = await fs.readFile(configPath, "utf-8");
  return parseToml(text);
}

function parseToml(input) {
  const root = {};
  let current = root;

  const lines = input.split(/\r?\n/);
  for (const raw of lines) {
    const line = stripComment(raw).trim();
    if (!line) continue;
    if (line.startsWith("[") && line.endsWith("]")) {
      const section = line.slice(1, -1).trim();
      if (!section) continue;
      current = ensurePath(root, section.split("."));
      continue;
    }
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const valueRaw = line.slice(idx + 1).trim();
    const value = parseTomlValue(valueRaw);
    setPath(current, key.split("."), value);
  }
  return root;
}

function stripComment(line) {
  const hashIndex = line.indexOf("#");
  if (hashIndex === -1) return line;
  return line.slice(0, hashIndex);
}

function parseTomlValue(raw) {
  if (!raw) return "";
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];
    return splitArray(inner).map(parseTomlValue);
  }
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1);
  }
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

function splitArray(raw) {
  const items = [];
  let current = "";
  let inQuotes = false;
  let quoteChar = "";
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if ((ch === '"' || ch === "'") && (!inQuotes || ch === quoteChar)) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = ch;
      } else {
        inQuotes = false;
      }
      current += ch;
      continue;
    }
    if (ch === "," && !inQuotes) {
      if (current.trim()) items.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) items.push(current.trim());
  return items;
}

function ensurePath(root, parts) {
  let target = root;
  for (const part of parts) {
    if (!part) continue;
    if (!Object.prototype.hasOwnProperty.call(target, part)) {
      target[part] = {};
    }
    const next = target[part];
    if (typeof next !== "object" || next === null) {
      target[part] = {};
    }
    target = target[part];
  }
  return target;
}

function setPath(root, parts, value) {
  if (!parts.length) return;
  let target = root;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!Object.prototype.hasOwnProperty.call(target, part)) {
      target[part] = {};
    }
    const next = target[part];
    if (typeof next !== "object" || next === null) {
      target[part] = {};
    }
    target = target[part];
  }
  target[parts[parts.length - 1]] = value;
}
