# 2026-01-31 UI 变更触发 npm 发布规则补强

## 迭代完成说明

- 增加规则：只要影响 CLI 内置 Web UI，必须执行 npm 发布闭环
- 目的：确保 CLI 内置 UI 与线上页面一致

## 使用方式

- 规则入口：`AGENTS.md`

## 测试 / 验证 / 验收方式

```bash
pnpm build
pnpm lint
pnpm -r --if-present tsc

# smoke-test: 非仓库目录校验规则可读
cd /tmp
rg "web-ui-change-requires-npm-release" /path/to/openclaw-manager/AGENTS.md
```

验收点：
- build/lint/tsc 全部通过
- AGENTS.md 中包含 UI 变更触发 npm 发布规则

## 发布 / 部署方式

```bash
pnpm deploy:pages
```

npm 发布（如需）：
- `pnpm release:publish`
- 发布版本：`openclaw-manager@0.1.6`

线上验收：
- `curl -fsS https://openclaw-manager.com/ > /dev/null`

## 影响范围 / 风险

- 影响范围：发布规则
- 风险：无
