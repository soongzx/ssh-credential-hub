# SSH Credential Hub - Agent Guidelines

## 项目概述

Windows 环境下管理的 SSH 连接信息工具。使用 Electron + Vue 3 + SQLite。

**核心功能**：管理 SSH 连接信息（IP、账户、密码、密钥、备注），支持标签/分组筛选，调用外部终端发起连接。

## 技术栈

- **运行时**: Electron 28
- **前端**: Vue 3 + TypeScript
- **构建**: Vite + electron-builder
- **存储**: SQLite (better-sqlite3)
- **加密**: AES-256-GCM
- **包管理**: npm

## 项目结构

```
src-electron/           # Electron 主进程
├── main.ts           # 入口
├── preload.ts        # 预加载脚本
├── database/        # SQLite 数据库层
│   ├── index.ts
│   ├── migrations/
│   └── repositories/ # ConnectionRepository, GroupRepository, TagRepository, TerminalConfigRepository
├── services/        # 业务服务
│   └── cryptoService.ts
└── ipc/            # 进程通信

src-renderer/         # Vue 3 前端
├── views/
│   └── MainLayout.vue
├── App.vue
├── main.ts
└── index.html

src/shared/          # 共享类型
├── types.ts
└── constants.ts

vite.config.ts        # Vite 配置
```

## 开发命令

```bash
npm install           # 安装依赖
npm run dev           # 开发模式运行（Vite dev server）
npm run build         # 生产构建
npm run build:exe     # 构建 Windows exe
```

## 构建 Windows exe

```bash
npm run build:exe
# 输出: release/SSH Credential Hub.exe
```

## 数据模型

- `connections` - 连接记录
- `tags` - 标签
- `groups` - 分组（支持树形嵌套）
- `connection_tags` - 连接-标签关联
- `terminal_configs` - 终端配置

## IPC 通信

主进程和渲染进程通过 `src-electron/ipc/index.ts` 中的 handler 进行通信。

## 安全

- 敏感字段使用 AES-256-GCM 加密
- 密钥通过机器特征生成
- 不在日志中输出敏感信息

## 代码规范

- ESLint + Prettier
- 规范文档: `docs/coding-standards.md`
- 架构决策: `docs/architecture-decisions.md`
