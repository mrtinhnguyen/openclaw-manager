# Developer Guide

"Scenario + Link" guidelines for project developers, organized by workflow.

## Development & Debugging

Goal: Enable developers to run, modify, and debug locally.

### Environment Preparation

```bash
pnpm install
```

### Local Development Start

```bash
pnpm dev
```

Common Environment Variables:
- `MANAGER_OPEN_BROWSER=0`: Do not auto-open browser on start
- `MANAGER_API_PORT=17321`: Specify API port
- `MANAGER_AUTH_USERNAME` / `MANAGER_AUTH_PASSWORD`: API admin account
- `VITE_MANAGER_API_URL`: Web access API URL

### Separate Start (Partial Debugging)

Start Web only:
```bash
pnpm dev:web
```

Start API only:
```bash
pnpm dev:api
```

### Self-Check (Build/Lint)

```bash
pnpm lint
pnpm build
```

## Verification

Goal: Simulate user operations to verify installation and flow availability.

### 1) Local Script Verification (Recommended)

Suitable for simulating "User running install script on local machine".

Recommended Order:

```bash
pnpm manager:reset
MANAGER_ADMIN_USER=admin MANAGER_ADMIN_PASS=pass bash scripts/install.sh
```

Note: `scripts/install.sh` forwards to `apps/web/public/install.sh`, equivalent to the online script.

### 2) Remote Script Verification (VPS)

Suitable for simulating "User installing via curl on VPS".

```bash
curl -fsSL https://blockclaw.app/install.sh | MANAGER_ADMIN_USER=admin MANAGER_ADMIN_PASS=pass bash
```

Non-interactive Auto-Install Node:

```bash
MANAGER_AUTO_INSTALL_NODE=1 \
MANAGER_ADMIN_USER=admin \
MANAGER_ADMIN_PASS=pass \
curl -fsSL https://blockclaw.app/install.sh | bash
```

### 3) Docker Verification

Suitable for VPS or isolated environments.

```bash
curl -fsSL https://blockclaw.app/docker.sh | bash
```

**With Credentials (Recommended)**

```bash
MANAGER_ADMIN_USER=admin MANAGER_ADMIN_PASS=pass curl -fsSL https://blockclaw.app/docker.sh | bash
```

**Local Script Verification (Equivalent to online docker.sh)**

```bash
MANAGER_ADMIN_USER=admin MANAGER_ADMIN_PASS=pass bash scripts/docker.sh
```

### 4) CLI End-to-End Verification
