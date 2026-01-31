# Onboarding 方案C：单一状态机与单一步骤源设计

## 目标

- 以 Domain 状态机作为唯一事实来源，消除步骤漂移与隐式依赖
- 步骤定义与顺序完全唯一化（UI/Domain/Flow 使用同一份注册表）
- 明确阻塞原因与待确认状态，保证“只前进不后退”同时可解释

## 关键设计

### 1) 单一步骤注册表

- 统一导出 `OnboardingStep` 与 `ONBOARDING_STEPS`
- UI（Sidebar/Renderer）与 Domain 都从该注册表读取顺序与元信息

### 2) Domain 状态机

- `OnboardingFlowState` 仅包含：
  - `currentStep`（单调递增）
  - `systemStep`（系统目标步骤）
  - `pendingStep/pendingSince`
  - `blockingReason`（显式阻塞）
- 事件驱动：
  - `STATUS_SYNC`：用最新 context 推进或判定阻塞
  - `REQUEST_CONFIRMATION`：对需确认步骤建立 pending

### 3) 阻塞原因与可解释性

- 若 `systemStep` 落后于 `currentStep`，生成阻塞原因并提示“系统需要先完成 X”
- 若 `pendingStep` 未确认，提示“等待系统确认”
- UI 仅展示，不参与判断

## 数据流

```
status refresh -> derive context -> flow machine -> store.flow -> viewModel -> UI
user action -> manager request confirmation -> flow pending -> status sync confirm
```

## 风险与对策

- **状态不更新**：flow 保持当前步，提示阻塞原因与待确认状态
- **历史步骤失效**：不回退，但明确提示“系统认为应完成的关键步骤”

## 验收标准

- 步骤仅在单一注册表维护
- UI 不再自行维护步骤序列
- 任何阻塞都有明确原因提示，不出现“无提示卡住”
