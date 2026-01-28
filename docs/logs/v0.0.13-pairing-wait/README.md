# v0.0.13 Pairing Wait Job

## 改了什么

- 新增 Discord 配对等待 Job：自动轮询并批准最新配对请求
- CLI 增加 `pairing-wait` 指令，TOML 支持 `pairing.wait/timeoutMs/pollMs/notify`

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（非仓库目录）：
  - `MANAGER_API_URL=http://127.0.0.1:17331 node /path/to/clawdbot-manager/scripts/manager-cli.mjs pairing-wait --timeout 3000`

## 发布/部署方式

- 无需发布

## 相关文档

- [CLI 快速验证指南](../../cli.md)
