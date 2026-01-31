# 2026-01-31 reset 统一链路（CLI 与 manager-cli）

## 迭代完成说明

- 提取 reset 共享逻辑，`openclaw-manager reset` 与 `pnpm manager:reset` 复用同一链路
- reset 清理范围对齐：config/install/clawdbot/sandbox
- CLI 增加 reset 相关参数（dry-run/force/keep/no-stop 等）

## 使用方式

```bash
openclaw-manager reset
pnpm manager:reset
```

## 测试 / 验证 / 验收方式

```bash
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke-test: 非仓库目录验证 reset 可清理指定目录
cd /tmp
mkdir -p "$HOME/.openclaw-manager-reset-test"
mkdir -p "$HOME/openclaw-manager-reset-install"
mkdir -p "$HOME/.clawdbot-reset-test"
node /path/to/packages/cli/bin/openclaw-manager.js reset \
  --config-dir "$HOME/.openclaw-manager-reset-test" \
  --install-dir "$HOME/openclaw-manager-reset-install" \
  --clawdbot-dir "$HOME/.clawdbot-reset-test" \
  --no-stop
```

验收点：
- build/lint/tsc 全部通过
- reset 执行后上述测试目录被删除

## 发布 / 部署方式

```bash
pnpm deploy:pages
```

npm 发布（如需）：
- `pnpm release:publish`
- 发布版本：`openclaw-manager@0.1.5`

线上验收：
- `curl -fsS https://openclaw-manager.com/ > /dev/null`

## 影响范围 / 风险

- 影响范围：CLI reset、manager:reset
- 风险：reset 清理范围更完整，需避免误用（提供 dry-run/force 限制）
