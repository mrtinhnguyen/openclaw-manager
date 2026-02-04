# v0.2.0 BlockClaw

## Overview

- **Version Bump**: Bumped version to `0.2.0` to signify major changes and new direction.
- **Path Updates**: Updated configuration and state directory paths to `.blockclaw-manager` and `/etc/blockclaw-manager`.

## Changes

### 1. Renaming & Refactoring
- **Package Name**: Updated `package.json` name to `blockclaw-manager`.
- **CLI Commands**: Updated build scripts to `pnpm build:blockclaw-manager`.
- **Service Names**: Updated systemd service references to `blockclaw-manager.service`.
- **Directory Paths**:
  - Config: `~/.blockclaw-manager/manager.toml` (or `/etc/blockclaw-manager/manager.toml` for root).
  - Install: `~/blockclaw-manager` (or `/opt/blockclaw-manager` for root).
  - State: Updated internal state directory candidates to include `.blockclaw-manager`.
  - Sandbox: Updated sandbox directory prefix to `blockclaw-manager-sandbox-`.

### 2. Documentation
- Converted `docs/*.md` to English.
- Updated `README.md` and landing page components with new installation commands (`npm i -g blockclaw-manager`).
- Updated deployment guides (`deploy.md`, `docker.md`) with new container names and project identifiers.

### 3. Deployment Configuration
- **Cloudflare Pages**: Updated project name default to `blockclaw-manager`.
- **Docker**: Updated default container name and image tags.

## Validation

### Build & Lint
```bash
pnpm build
pnpm lint
pnpm -r --if-present tsc
```

### Smoke Test (CLI)
```bash
# Verify CLI help and version
node scripts/manager-cli.mjs --help
node scripts/manager-cli.mjs --version
```

### Sandbox Verification
```bash
# Run isolated verification
pnpm manager:verify
```

## Deployment Steps

1. **NPM Release**:
   ```bash
   pnpm release:publish
   ```
   (Ensures `blockclaw-manager` package is published to registry)

2. **Web Deployment**:
   ```bash
   pnpm deploy:pages
   ```

## Rollback Plan

If critical issues arise, revert to v0.1.18 and re-deploy the previous "OpenClaw Manager" artifacts.
