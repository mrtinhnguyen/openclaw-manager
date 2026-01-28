# v0.0.7 Process Spawn Guard

## 改了什么

- 进程管理器在 `spawn` 失败时记录日志并标记退出码
- 避免 `clawdbot` 未安装导致 API 直接崩溃
- 允许运行态重试启动（安装 CLI 后可再次启动）

## 验证方式

- `pnpm -r --if-present lint`
- `pnpm -r --if-present build`
- 冒烟（非仓库目录）：
  - 在容器内未安装 CLI 时触发 `gateway-run`，确认 API 不崩溃且日志包含 `spawn error`

## 发布/部署方式

- `pnpm deploy:pages`
