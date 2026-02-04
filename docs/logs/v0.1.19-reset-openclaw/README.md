# 2026-02-01 Reset also cleans .openclaw

## Background / Problem

- After executing `manager:reset`, OpenClaw's pairing/allowlist data remains in `~/.openclaw`, allowing use without re-pairing.

## Decisions

- Add `~/.openclaw` (or `OPENCLAW_STATE_DIR`) to `reset` targets to ensure thorough cleanup of pairing state.
- Maintain safety check mechanism to avoid accidental deletion of unintended paths.

## Changes

- User-visible changes
  - `manager:reset` will clean `~/.openclaw` (OpenClaw state directory).

- Key implementation points
  - `packages/cli/src/lib/reset-shared.ts`: Add openclaw cleanup target and safety whitelist.

## Verification (How to confirm expectations)

```bash
# build / lint / typecheck
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke-check (non-repo directory)
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"
openclaw-manager reset --dry-run
```

Acceptance Points:

- build/lint/tsc all pass.
- dry-run output contains `openclaw` target path.

## Release / Deployment

- If npm publish is needed, execute according to `docs/workflows/npm-release-process.md`.

## Impact / Risks

- Breaking change: No.
- Risk: If `OPENCLAW_STATE_DIR` is set to an unintended directory, `--force` is required.
