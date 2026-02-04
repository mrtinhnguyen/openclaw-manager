# Basic Installation (Non-Docker)

Scenario: Personal computer or VPS, direct installation, no Docker dependency.

## 1) Installation

### Linux / macOS

Recommended (with admin account):

```bash
curl -fsSL https://blockclaw.app/install.sh | MANAGER_ADMIN_USER=admin MANAGER_ADMIN_PASS=pass bash
```

To auto-install Node (non-interactive environment):

```bash
MANAGER_AUTO_INSTALL_NODE=1 \
MANAGER_ADMIN_USER=admin \
MANAGER_ADMIN_PASS=pass \
curl -fsSL https://blockclaw.app/install.sh | bash
```

For interactive input, remove environment variables:

```bash
curl -fsSL https://blockclaw.app/install.sh | bash
```

The script will detect Node.js and ask to auto-install if missing.

### Windows (PowerShell)

```powershell
$env:MANAGER_ADMIN_USER="admin"
$env:MANAGER_ADMIN_PASS="pass"
irm https://blockclaw.app/install.ps1 | iex
```

## 2) Open Console

- Local access: `http://127.0.0.1:17321/`
- Remote access: `http://<your-host>:17321/`

If using a VPS, ensure firewall/security groups allow port `17321`.
For local-only access, set `MANAGER_API_HOST=127.0.0.1`.

## 3) Login and Complete Wizard

Log in using the admin account set during installation, then follow the wizard:

1) CLI Installation
2) Start Gateway
3) Discord Token
4) AI Provider
5) Pairing
6) Probing

## 4) Quick Validation (Optional)

```bash
curl -fsS http://<your-host>:17321/health
curl -fsS -u admin:pass http://<your-host>:17321/api/status
```

## Common Environment Variables

- `MANAGER_ADMIN_USER` / `MANAGER_ADMIN_PASS`: Admin account
- `MANAGER_API_PORT`: API Port (Default `17321`)
- `MANAGER_API_HOST`: API Bind Address (Default `0.0.0.0`, accessible externally)
- `MANAGER_PUBLIC_HOST`: Public Address (Used for printing accessible links)
- `MANAGER_AUTO_INSTALL_NODE=1`: Auto-install Node if missing (Non-interactive)
