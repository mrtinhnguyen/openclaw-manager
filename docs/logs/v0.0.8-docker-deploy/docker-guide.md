# Docker 部署指南（最简）

目标：在 Docker 容器里一键启动管理控制台。

## 直接运行（推荐）

```bash
docker rm -f moltbot-manager 2>/dev/null || true
docker volume create moltbot-manager-config

docker run -d --name moltbot-manager \
  -p 17321:17321 \
  -e MANAGER_ADMIN_USER=admin \
  -e MANAGER_ADMIN_PASS=pass \
  -e MANAGER_API_HOST=0.0.0.0 \
  -e MANAGER_API_PORT=17321 \
  -e MANAGER_WEB_DIST=/opt/moltbot-manager/apps/web/dist \
  -e MANAGER_CONFIG_PATH=/etc/clawdbot-manager/config.json \
  -v moltbot-manager-config:/etc/clawdbot-manager \
  node:22-bullseye bash -lc "set -euo pipefail; \
  REPO_URL=\"\${MANAGER_REPO_URL:-https://github.com/Peiiii/moltbot-manager.git}\"; \
  apt-get update -y >/dev/null; \
  apt-get install -y --no-install-recommends git curl ca-certificates >/dev/null; \
  corepack enable; corepack prepare pnpm@10.23.0 --activate; \
  git clone \"$REPO_URL\" /opt/moltbot-manager; \
  cd /opt/moltbot-manager; \
  CI=true pnpm install >/dev/null; pnpm build >/dev/null; \
  node apps/api/scripts/create-admin.mjs --username \"$MANAGER_ADMIN_USER\" --password \"$MANAGER_ADMIN_PASS\" --config /etc/clawdbot-manager/config.json; \
  exec node /opt/moltbot-manager/apps/api/dist/index.js"
```

打开：
- `http://127.0.0.1:17321/`
- 账号：`admin`
- 密码：`pass`

## 常用命令

查看日志：
```bash
docker logs -f moltbot-manager
```

停止并删除容器：
```bash
docker rm -f moltbot-manager
```

彻底清理（连配置一起删）：
```bash
docker rm -f moltbot-manager
docker volume rm moltbot-manager-config
```

## 可选参数

- `MANAGER_REPO_URL`：自定义仓库地址（默认 `https://github.com/Peiiii/moltbot-manager.git`）
- `MANAGER_API_PORT`：改端口（同时调整 `-p` 映射）
