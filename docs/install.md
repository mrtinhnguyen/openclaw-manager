# Installation and Frontend Usage

This guide is for users who need to deploy via script and use the frontend console.

For basic non-Docker scenarios, please see: [docs/get-started-basic.md](docs/get-started-basic.md).
For Docker scenarios, please see: [docs/get-started-docker.md](docs/get-started-docker.md).

## One-Click Installation

### Linux / macOS

```bash
curl -fsSL https://blockclaw.app/install.sh | bash
```

One-line with credentials (recommended):
```bash
curl -fsSL https://blockclaw.app/install.sh | MANAGER_ADMIN_USER=admin MANAGER_ADMIN_PASS=pass bash
```

Tip: The installation process will prompt for an admin username/password; if running in a non-interactive environment (CI/script), please set `MANAGER_ADMIN_USER` and `MANAGER_ADMIN_PASS` in advance.

### Windows (PowerShell)

```powershell
iwr https://blockclaw.app/install.ps1 -UseBasicParsing | iex
```

## Docker One-Click Start

```bash
curl -fsSL https://blockclaw.app/docker.sh | bash
```

For more parameters, see [Docker Deployment Guide](/docker).

## Using the Frontend After Installation

1) Open your browser and visit:
- `http://<your-host>:17321/`
2) Log in using the admin account set during installation
3) Follow the wizard to complete: CLI installation, Gateway startup, Discord Token, AI Provider, Pairing, Probing

Tip: The script binds `MANAGER_API_HOST=0.0.0.0` by default. VPS users need to allow port `17321`; for local-only access, set `MANAGER_API_HOST=127.0.0.1`.
The script will ask to install Node.js if missing (set `MANAGER_AUTO_INSTALL_NODE=1` to auto-agree).

## Common Environment Variables

Linux / macOS (Example):
```bash
MANAGER_ADMIN_USER=admin \
MANAGER_ADMIN_PASS=pass \
MANAGER_API_PORT=17321 \
MANAGER_AUTO_INSTALL_NODE=1 \
curl -fsSL https://blockclaw.app/install.sh | bash
```

Common Variables:

- `MANAGER_ADMIN_USER` / `MANAGER_ADMIN_PASS`
- `MANAGER_API_HOST` (Default `0.0.0.0`)
- `MANAGER_API_PORT` (Default `17321`)
- `MANAGER_PUBLIC_HOST` (Used for printing public links)
- `MANAGER_AUTO_INSTALL_NODE=1` (Auto-install Node if missing)

Windows PowerShell (Example):
```powershell
$env:MANAGER_ADMIN_USER="admin"
$env:MANAGER_ADMIN_PASS="pass"
$env:MANAGER_API_PORT="17321"
iwr https://blockclaw.app/install.ps1 -UseBasicParsing | iex
```

## Common Issues

- Cannot open page: Confirm `MANAGER_API_PORT` is allowed and service is started
- Forgot admin account: Re-run the installation script and set a new admin account
- Need to stop service: Run `pnpm manager:server-stop` in the installation directory (requires local permissions)
