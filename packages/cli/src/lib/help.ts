import { printBanner } from "./banner.js";

export function printHelp(): void {
  printBanner();
  console.log(
    `\nUsage:\n  blockclaw-manager <command> [options]\n\nCommands:\n  start     Start BlockClaw Manager\n  stop      Stop the running Manager process\n  stop-all  Stop Manager, sandboxes, and gateway processes\n  reset     Stop all and remove local manager data\n\nOptions:\n  -h, --help            Show help\n  -v, --version         Show version\n  -u, --user <name>     Admin username (start)\n  -p, --pass <value>    Admin password (start)\n  --non-interactive     Fail instead of prompting for credentials\n  --api-port <port>     API port (default: 17321)\n  --api-host <host>     API host (default: 0.0.0.0)\n  --config-dir <dir>    Config directory\n  --config-path <path>  Config file path\n  --install-dir <dir>   Install directory (reset)\n  --dry-run             Print removals without deleting (reset)\n  --no-stop             Skip stopping services (reset)\n  --force               Allow removing non-default paths (reset)\n`
  );
}

export function printWelcome(): void {
  printBanner();
  console.log(
    `\nQuick start:\n  blockclaw-manager start\n\nCommon commands:\n  blockclaw-manager stop\n  blockclaw-manager stop-all\n  blockclaw-manager reset\n\nTip: First start will ask for admin username/password.\nDocs: https://blockclaw.app\n`
  );
}
