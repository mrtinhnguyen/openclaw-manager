# v0.0.18 CLI Gateway Stop

## 改了什么

- CLI 新增网关停止指令，支持关闭 manager 启动的网关进程
- 文档补充 `gateway-stop` 用法

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- `pnpm -r --if-present tsc`
- 冒烟（非仓库目录）：
  - `pnpm manager:status -- --config /tmp/manager.toml`
  - `pnpm manager:discord-token -- --config /tmp/manager.toml`
  - `pnpm manager:ai-auth -- --config /tmp/manager.toml`
  - `pnpm manager:quickstart -- --config /tmp/manager.toml`
  - `pnpm manager:gateway-stop -- --config /tmp/manager.toml`
  - `pnpm manager:pairing-approve -- --code <CODE> --continue`

## 发布/部署方式

- 无需发布

## 相关文档

- [CLI 使用指南](/cli)
