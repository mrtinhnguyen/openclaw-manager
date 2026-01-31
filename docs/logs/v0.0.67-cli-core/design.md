# 设计文档：OpenClaw Manager CLI 核心命令

## 目标

- 只保留并打磨 3 个核心命令：`start` / `stop` / `stop-all`
- `start` 首次运行自动引导设置管理员账号密码（交互式），也支持非交互式传参
- `stop` 停止 Manager
- `stop-all` 停止 Manager + sandbox + gateway 进程
- 未输入命令时给出清晰引导，符合“顶级产品”提示体验

## 约束 / 假设

- CLI 是终端用户入口，不能要求用户理解仓库结构
- 配置文件默认路径以 `MANAGER_CONFIG_DIR` 优先，其次 `~/.openclaw-manager`
- 兼容历史环境：允许读取 `~/.clawdbot-manager` 的 pid
- 交互式输入必须使用开源库（prompts）

## 核心交互流程

### start

1) 检查 `manager.pid` 是否存在且进程仍存活 → 已运行则提示并退出
2) 判断配置文件是否存在且包含 `auth` 字段：
   - 有配置：直接启动
   - 无配置：
     - 若提供 `--user/--password` 或环境变量 → 写入 config
     - 否则进入 prompts 交互式输入
3) 启动 API 进程并写入 pid 文件
4) 输出访问地址与日志路径

### stop

1) 尝试停止 systemd service（如果存在）
2) 读取 `manager.pid` 并终止进程
3) 若未找到 pid，再使用端口监听查询尝试停止

### stop-all

1) 执行 stop
2) 在 /tmp 查找 sandbox 目录并按 `manager-api.pid` 终止
3) 尝试停止 `clawdbot-gateway` 进程

## 参数设计

- `start`:
  - `--user`, `--password`：非交互式指定管理员账号密码
  - `--non-interactive`：禁用 prompts，缺凭据则报错
  - `--api-port`, `--api-host`
  - `--config-dir`, `--config-path`, `--log-path`, `--error-log-path`
- `stop`, `stop-all`:
  - `--api-port`（仅用于端口兜底停止）
  - `--config-dir`（用于定位 pid）

## 风险

- 不同平台（Windows/macOS/Linux）进程探测差异：
  - Windows 无 `pgrep/lsof`，`stop-all` 对 gateway 仅做 best-effort
- 用户已有旧版配置目录，需兼容读取 pid

## 验收标准

- `openclaw-manager` 不带命令时输出引导文案
- `openclaw-manager start --user --password` 能生成配置并启动
- `openclaw-manager stop` 能停止刚启动的进程
- `openclaw-manager stop-all` 能覆盖 sandbox 与 gateway 的 best-effort 停止
