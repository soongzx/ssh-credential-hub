# SSH Credential Hub

Windows 环境下管理的 SSH 连接信息工具。

## 功能定位

管理几百上千个 SSH 连接信息，包含：
- IP 地址
- 账户
- 密码
- 密钥
- 功能备注

支持分组保存、查看，使用标签、分组进行筛选。

## 技术栈

- **运行时**: Electron 28
- **前端**: 纯 HTML/JS + Vue 3
- **存储**: SQLite (better-sqlite3)
- **构建**: TypeScript + electron-builder
- **包管理**: npm

## 开发阶段规划

### 第一阶段：项目资源管理

- [ ] SQLite 数据库设计与初始化
- [ ] 连接记录的增删改查
- [ ] 标签管理
- [ ] 分组管理
- [ ] 列表展示与筛选
- [ ] 搜索功能

### 第二阶段：终端深度对接

选择微软开源的 Windows Terminal 或 Tabby 进行深度集成：
- [ ] 连接参数组装
- [ ] 终端启动与参数传递
- [ ] 密码/密钥的安全传递

### 第三阶段：多终端适配

扩展支持更多 SSH 客户端：
- [ ] Xshell 适配
- [ ] SecureCRT 适配
- [ ] PuTTY 适配

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run start
```

### 构建 Windows exe

```bash
npm run build:exe
```

输出：`release/SSH Credential Hub.exe`

## 项目结构

```
src/
├── main/                 # Electron 主进程
│   ├── main.ts          # 入口
│   ├── database/        # SQLite 相关
│   └── ipc/             # 进程通信
├── preload/             # 预加载脚本
├── renderer/            # 前端界面
│   ├── views/          # 页面
│   ├── components/     # 组件
│   └── stores/         # 状态管理
└── shared/             # 共享类型
```

## License

MIT
