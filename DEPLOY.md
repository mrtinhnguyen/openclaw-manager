# Build & Deploy Guide for BlockClaw Manager

This guide details how to build the project and publish the CLI package to NPM.

## Prerequisites

- **Node.js**: >= 22.12.0
- **pnpm**: >= 10.x
- **NPM Account**: Required for publishing.

## Project Structure

The project is a monorepo. The main artifact to be published is the CLI package located in `packages/cli`.

- **Root Package**: `blockclaw-manager` (Orchestrates workspace)
- **CLI Package**: `packages/cli` (The package that gets published to NPM)

## 1. Build

Before publishing, you must build the project to ensure all TypeScript code is compiled and assets are bundled.

Run the following command in the root directory:

```bash
pnpm build:blockclaw-manager
```

This command performs the following:
1. Compiles all workspace packages (`api`, `web`, `landing`, `cli`) using `tsc` and `vite`.
2. Runs `scripts/build-blockclaw-manager.mjs` to copy the built `api` and `web` assets into the CLI package's `dist` folders.

> **Note**: Ensure the build completes without errors.

## 2. Versioning

We use [changesets](https://github.com/changesets/changesets) for version management.

1. **Create a changeset** (if you made code changes):
   ```bash
   pnpm changeset
   ```
   Follow the prompts to select packages and describe changes.

2. **Bump Version**:
   ```bash
   pnpm release:version
   ```
   This consumes the changesets and updates `package.json` versions and `CHANGELOG.md`.

## 3. Publish to NPM

Once built and versioned, you can publish the package.

### Using the Release Script

```bash
pnpm release:publish
```

This script runs the build check and then publishes using `changeset publish`.

### Manual Publish

Alternatively, you can publish directly from the CLI package directory:

```bash
# 1. Build first
pnpm build:blockclaw-manager

# 2. Go to CLI package
cd packages/cli

# 3. Publish
npm publish --access public
```

## 4. Verification

After publishing, verify the package is available and works:

```bash
# Install globally
npm install -g blockclaw-manager

# Check version
blockclaw-manager --version

# Run help
blockclaw-manager --help
```

## Troubleshooting

- **Permissions**: Ensure you are logged in to npm (`npm login`).
- **Build Errors**: If `pnpm build` fails, check the error output. Ensure dependencies are installed (`pnpm install`).
- **Missing Assets**: If the CLI runs but UI is missing, ensure `scripts/build-blockclaw-manager.mjs` ran successfully.
