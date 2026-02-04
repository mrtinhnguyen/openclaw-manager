# 2026-02-01 Gateway Verification Steps + On-Demand Startup

## Background / Problem

- The gateway acts as a hard step, causing flow regressions and blocking, which needs to be changed to "Verify Gateway" and started on-demand in subsequent steps.

## Decisions

- Keep step ID as `gateway`, adjust semantics to "Verify Gateway".
- Introduce `gatewayVerified` event to memorize verified state, avoiding regression due to brief gateway unavailability.
- Trigger gateway startup on-demand when entering token/ai/pairing/probe steps, instead of forcing it as a flow blocker.

## Changes

- User-visible changes
  - Guide step "Start Gateway" changed to "Verify Gateway", indicating it can be started on-demand.
  - Automatically attempt to start gateway (if not ready) when entering subsequent steps.

- Key implementation points
  - `apps/web/src/features/onboarding/onboarding-steps.ts`: Flow judgment introduces `gatewayVerified`.
  - `apps/web/src/features/onboarding/domain/context.ts`: Context adds `gatewayVerified`.
  - `apps/web/src/managers/onboarding-manager.ts`: State synchronization logic memorizes gateway verification.
  - `apps/web/src/features/onboarding/use-onboarding-effects.ts`: On-demand gateway startup hook.
  - `apps/web/src/components/wizard-steps.tsx`: Gateway step copy/button adjustments.

## Verification (How to confirm expectations)

```bash
# build / lint / typecheck
pnpm build:openclaw-manager
pnpm lint
pnpm -r --if-present tsc

# smoke-check (non-repo directory)
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"
npm init -y
npm install openclaw-manager@0.1.18
./node_modules/.bin/openclaw-manager --help
```

Acceptance Points:

- build/lint/tsc all pass.
- CLI executes normally in temporary directory and outputs help.

## Release / Deployment

- Execute according to `docs/workflows/npm-release-process.md`:
  - `pnpm release:version`
  - `pnpm release:publish`
- Release result: `openclaw-manager@0.1.18`.

## Impact / Risks

- Breaking change: No.
- Rollback method: If rollback is needed, use `npm deprecate openclaw-manager@0.1.18` and publish a fix version.
