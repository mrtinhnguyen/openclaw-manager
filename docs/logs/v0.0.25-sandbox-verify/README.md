# v0.0.25 Sandbox Verify

## 改了什么

- 新增 `verify` 命令：一键创建沙盒并执行 `apply`
- 自动将 `manager.toml` 合并到沙盒配置，复用 token/账号信息

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（非仓库目录）：
  - `node /path/to/clawdbot-manager/scripts/manager-cli.mjs verify --no-start --print-env`

## 发布/部署方式

- 无需发布

## 相关文档

- [CLI 使用指南](../../cli.md)
