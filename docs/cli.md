# BlockClaw Manager CLI User Guide

This guide is for users who need to complete configuration and pairing via the command line.

## Prerequisites

- BlockClaw Manager API is started
- Admin account, Discord Bot Token, AI Provider, and API Key are ready
- Run commands inside the repository (`pnpm manager:*`), or invoke the script directly

### How to Run

Using `pnpm` inside the repository:
```bash
pnpm manager:status
```

Direct script invocation:
```bash
node scripts/manager-cli.mjs status
```

## Configuration File

Default configuration file: `manager.toml` (can be specified via `--config` or `MANAGER_CONFIG`).
It is recommended to add this file to `.gitignore` to avoid committing sensitive information.

Configuration Priority:
1) Command line arguments
2) Environment variables
3) `manager.toml`
4) Interactive input (only enabled in interactive mode)

Common Environment Variables:
- `MANAGER_API_URL`: API Address
- `MANAGER_AUTH_USER` / `MANAGER_AUTH_PASS`: Admin account
- `MANAGER_NON_INTERACTIVE=1`: Disable interactive prompts

## Recommended Workflows

### Plan A: Interactive Pairing Code Input

1) Configure account and Token in `manager.toml`
2) Run the one-click process; enter pairing code interactively

```bash
pnpm manager:apply -- --config ./manager.toml
```

### Plan B: Prepare Information First, Then Pair Manually

1) Configure account and Token in `manager.toml`, without `pairing`
2) Run the one-click process (does not trigger pairing)
3) Get the pairing code, then execute pairing separately and continue probing

```bash
pnpm manager:apply -- --config ./manager.toml
pnpm manager:pairing-approve -- --code "ABCDE123" --continue
```

### Plan C: Isolated Sandbox Quick Validation

1) Generate an isolated environment and start the API
2) Execute `apply` using the exported environment variables
3) Stop the sandbox after validation

```bash
pnpm manager:sandbox -- --print-env
# Optional: --user/--pass to customize sandbox admin account
# Run apply using the output exports
pnpm manager:sandbox-stop -- --dir "/tmp/blockclaw-manager-sandbox-<timestamp>"
```

### Plan D: One-Click Isolated Verification

```bash
pnpm manager:verify
```

## Complete Example Workflow

Below is a complete sequence example from zero to validation completion (including pairing). Replace the placeholders in the example with your actual configuration and save as `manager.toml`.

### 1) Prepare Configuration File

```toml
[api]
base = "http://127.0.0.1:17321"

[admin]
user = "admin"
pass = "pass"

[discord]
token = "YOUR_DISCORD_BOT_TOKEN"

[ai]
provider = "minimax-cn"
key = "YOUR_API_KEY"
```
