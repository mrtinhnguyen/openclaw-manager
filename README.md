# OpenClaw Manager (Clawdbot Manager)

[![npm version](https://img.shields.io/npm/v/openclaw-manager.svg)](https://www.npmjs.com/package/openclaw-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

OpenClaw（Clawdbot）安装与配置工具，本地一站式完成安装、配置与配对。

![OpenClaw Manager 截图](images/screenshots/openclaw-manager.png)

## 安装 Manager

### 方式 A：NPM（推荐）

```bash
npm i -g openclaw-manager
openclaw-manager start
```

常用命令：

- `openclaw-manager stop`
- `openclaw-manager stop-all`
- `openclaw-manager reset`

首次启动可显式指定账号密码：

```bash
openclaw-manager start --user admin --pass pass
```

### 方式 B：脚本安装

**Mac / Linux**

```bash
curl -fsSL https://openclaw-manager.com/install.sh | bash
```

安装过程中会提示设置管理员用户名和密码。

**Windows**（暂未验证，请谨慎使用）

```powershell
irm https://openclaw-manager.com/install.ps1 | iex
```

**Docker**

```bash
curl -fsSL https://openclaw-manager.com/docker.sh | bash
```

更多 Docker 参数与说明见：[docs/get-started-docker.md](docs/get-started-docker.md)、[docs/docker.md](docs/docker.md)。

## 使用 Manager 安装 OpenClaw

1. 运行安装命令 → Manager 服务自动启动
2. 浏览器访问 `http://localhost:17321`
3. 使用安装时设置的用户名和密码登录管理面板
4. 按引导安装 OpenClaw CLI（npm 包名 `clawdbot`）
5. 配置 Discord Bot Token
6. 配置 AI 模型（API Key）
7. 与 Bot 配对
8. 完成，即可开始使用
