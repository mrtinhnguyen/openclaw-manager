# YYYY-MM-DD <Title>

## Background / Problem

- Why are we doing this? (User pain points / Motivation / Current issues)

## Rules (Optional)

- Planning documents should not contain specific timelines, only milestone sequences and acceptance criteria.
- Planning document filenames are suggested to end with `.plan.md` to distinguish "planning" from "implementation logs".

## Decisions

- What to do, what NOT to do (Key trade-offs)

## Changes

- User-visible changes (CLI behavior / Output / Defaults, etc.)
- Key implementation points (Point to key modules in core/cli)

## Verification (How to confirm expectations)

Keep it lightweight: 3-6 commands + clear "Acceptance Points".

```bash
# build / lint / typecheck
pnpm build
pnpm lint
pnpm typecheck

# smoke-check (add as needed)
pnpm -s cli --help
```

Acceptance Points:

- Clearly state "what output/behavior counts as correct"

## Release / Deployment

If this change affects npm packages or online environments, clarify how to publish.

```bash
# 1) Create changeset (select affected packages)
pnpm changeset

# 2) Local verification
pnpm release:check
pnpm release:dry

# 3) Version & changelog
pnpm release:version

# 4) Publish to npm (requires NPM_TOKEN or login)
pnpm release
```

Notes:

- For more detailed release instructions, refer to `docs/workflows/npm-release-process.md`; do not repeat it in every log.

## Impact / Risks

- Breaking change? (Yes/No)
- Rollback method (if needed)
