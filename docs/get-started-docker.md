# Docker Quick Start

Scenario: Quickly start and experience BlockClaw Manager using Docker.

## 1) One-Click Start

```bash
curl -fsSL https://blockclaw.app/docker.sh | bash
```

With credentials:

```bash
MANAGER_ADMIN_USER=admin MANAGER_ADMIN_PASS=pass curl -fsSL https://blockclaw.app/docker.sh | bash
```

Manually specify public address (for printing accessible links):

```bash
MANAGER_PUBLIC_HOST=<your-public-ip-or-domain> curl -fsSL https://blockclaw.app/docker.sh | bash
```

Extend gateway startup timeout (default 60000ms):

```bash
MANAGER_GATEWAY_TIMEOUT_MS=60000 curl -fsSL https://blockclaw.app/docker.sh | bash
```

The script will automatically pull the container and output the access URL and login information.

## 2) Open Console

- Local access: `http://127.0.0.1:17321/`
- Remote access: `http://<your-host>:17321/`

If using a VPS, ensure firewall/security groups allow port `17321`.
For local-only access, set `MANAGER_API_HOST=127.0.0.1`.
The script will attempt to detect the public IP and print the accessible link; if detection fails, use `MANAGER_PUBLIC_HOST` to specify.

## 3) Login and Complete Wizard

Log in using the admin account output by the script, then follow the wizard:

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

- `MANAGER_DOCKER_NAME`: Container name
- `MANAGER_CONFIG_VOLUME`: Configuration volume name
- `MANAGER_API_PORT`: Exposed port (Default `17321`)
- `MANAGER_ADMIN_USER` / `MANAGER_ADMIN_PASS`: Admin account
- `MANAGER_PUBLIC_HOST`: Public address (Used for printing accessible links)
- `MANAGER_GATEWAY_TIMEOUT_MS`: Gateway startup timeout (milliseconds)
