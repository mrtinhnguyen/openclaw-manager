# v0.0.52 Gateway Timeout Default

## 改了什么

- 快速启动的默认网关超时提升为 60000ms
- Docker get started 文档同步默认值

## 使用方式

- 默认超时已提升（如需覆盖：`MANAGER_GATEWAY_TIMEOUT_MS=60000`）

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（非仓库目录）：
  - `MANAGER_API_PORT=17421 MANAGER_API_HOST=127.0.0.1 MANAGER_CONFIG_PATH=/tmp/clawdbot-manager-smoke/config.json MANAGER_WEB_DIST=/path/to/clawdbot-manager/apps/web/dist node /path/to/clawdbot-manager/apps/api/dist/index.js`
  - `curl -fsS http://127.0.0.1:17421/health`

## 发布/部署方式

- 无需发布
