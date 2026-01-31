import type { CliFlags } from "../lib/types.js";
import { stopAll } from "./stop-all.js";
import { listSandboxDirs } from "../lib/sandbox.js";
import { resetEnvironmentShared } from "../lib/reset-shared.js";

export function resetManager(flags: CliFlags): { ok: boolean; messages: string[]; error?: string } {
  return resetEnvironmentShared({
    flags: {
      dryRun: flags.dryRun,
      keepClawdbot: flags.keepClawdbot,
      noStop: flags.noStop,
      force: flags.force,
      configDir: flags.configDir,
      configPath: flags.configPath,
      installDir: flags.installDir,
      clawdbotDir: flags.clawdbotDir
    },
    stopAll: () => stopAll(flags),
    sandboxDirs: listSandboxDirs()
  });
}
