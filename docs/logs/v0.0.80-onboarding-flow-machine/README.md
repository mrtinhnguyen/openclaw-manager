# v0.0.80 Onboarding Flow Machine

## 迭代完成说明

- 方案C：落地单一 Domain 状态机与单一步骤注册表，统一步骤顺序与元信息来源
- Onboarding Store/Manager/ViewModel 全部改为 FlowState 驱动，消除多处判断与漂移
- 增加阻塞原因提示（等待确认 / 系统仍停留在前置步骤），保障“只前进不后退”且可解释

## 使用方式

- 打开 Web 控制台，按引导完成配置流程；如遇阻塞会显示明确原因提示

## 验证方式

- `pnpm build`
- `pnpm lint`
- `pnpm -r --if-present tsc`
- 冒烟：`curl -fsS https://openclaw-manager.com/ > /dev/null`（在非仓库目录执行）

## 发布/部署方式

- `pnpm deploy:pages`
- 按 `docs/workflows/npm-release-process.md` 执行 `pnpm release:publish`
  - 当前阻塞：npm token 失效导致发布失败，需要更新 npm 认证后重试
