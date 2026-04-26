# SSH Credential Hub - Agent Guidelines

## 项目概述

Windows 环境下管理的 SSH 连接信息工具。使用 Electron + Vue 3 + SQLite。

**核心功能**：管理 SSH 连接信息（IP、账户、密码、密钥、备注），支持标签/分组筛选，调用外部终端发起连接。

## 技术栈

- **运行时**: Electron 28
- **前端**: Vue 3 + TypeScript
- **存储**: SQLite (better-sqlite3)
- **构建**: TypeScript + electron-builder
- **包管理**: npm

## 项目结构

```
src/
├── main/                 # Electron 主进程
│   ├── main.ts          # 入口
│   ├── database/        # SQLite 操作
│   ├── services/       # 业务服务
│   └── ipc/            # 进程通信
├── preload/             # 预加载脚本
└── renderer/            # 前端界面
    ├── views/          # 页面
    ├── components/     # 组件
    └── stores/         # 状态管理
```

## 开发命令

```bash
npm install           # 安装依赖
npm run start         # 开发模式运行
npm run build:electron    # 编译主进程
npm run build:exe     # 构建 Windows exe
```

## 构建 Windows exe

```bash
npm run build:exe
# 输出: release/SSH Credential Hub.exe
```

## 开发阶段

1. **第一阶段**：资源管理（SQLite、分组、标签、搜索）
2. **第二阶段**：终端对接（Windows Terminal / Tabby）
3. **第三阶段**：多终端适配（Xshell、SecureCRT、PuTTY）

## 数据模型

- `connections` - 连接记录
- `tags` - 标签
- `groups` - 分组
- `connection_tags` - 连接-标签关联
- `terminal_configs` - 终端配置

## 安全

- 敏感字段使用 AES-256-GCM 加密
- 密钥通过机器特征生成
- 不在日志中输出敏感信息
