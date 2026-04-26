# SSH Credential Hub - 设计文档

## 1. 项目概述

### 1.1 目标

打造一款 Windows 环境下高效的 SSH 连接信息管理工具，能够管理数百上千个 SSH 连接，支持多种认证方式，并通过外部终端发起连接。

### 1.2 核心价值

- 集中管理：统一管理所有 SSH 连接信息
- 安全存储：密码、密钥等敏感信息加密存储
- 高效检索：支持标签、分组、搜索快速定位
- 灵活对接：支持多种 SSH 客户端

## 2. 技术架构

### 2.1 技术选型

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| 运行时 | Electron 28 | 跨平台桌面应用框架 |
| 前端 | Vue 3 + TypeScript | 响应式 UI |
| 存储 | better-sqlite3 | 同步 SQLite，性能好 |
| 构建 | electron-builder | Windows exe 打包 |
| 加密 | crypto | Node.js 内置 AES 加密 |

### 2.2 模块划分

```
┌─────────────────────────────────────────────────┐
│                   Electron App                   │
├─────────────────────────────────────────────────┤
│  Main Process                                    │
│  ├── Database Service    # SQLite 操作          │
│  ├── Crypto Service     # 密码加密/解密         │
│  ├── SSH Launcher       # 终端启动             │
│  └── IPC Handler        # 进程通信             │
├─────────────────────────────────────────────────┤
│  Renderer Process                               │
│  ├── Connection List    # 连接列表             │
│  ├── Connection Editor  # 连接编辑             │
│  ├── Tag Manager        # 标签管理             │
│  └── Group Manager      # 分组管理             │
└─────────────────────────────────────────────────┘
```

## 3. 数据模型

### 3.1 连接记录 (connections)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 连接名称 |
| host | TEXT | IP 地址或域名 |
| port | INTEGER | 端口，默认 22 |
| username | TEXT | 用户名 |
| auth_type | TEXT | 认证方式：password/publickey/agent |
| password_encrypted | TEXT | 加密密码（可选） |
| private_key_path | TEXT | 私钥路径（可选） |
| passphrase_encrypted | TEXT | 私钥口令加密（可选） |
| group_id | TEXT | 分组 ID（外键） |
| description | TEXT | 功能备注 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 3.2 标签 (tags)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 标签名 |
| color | TEXT | 颜色代码 |
| created_at | DATETIME | 创建时间 |

### 3.3 连接-标签关联 (connection_tags)

| 字段 | 类型 | 说明 |
|------|------|------|
| connection_id | TEXT | 连接 ID |
| tag_id | TEXT | 标签 ID |

### 3.4 分组 (groups)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 分组名称 |
| parent_id | TEXT | 父分组 ID（支持嵌套） |
| created_at | DATETIME | 创建时间 |

### 3.5 终端配置 (terminal_configs)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 配置名称 |
| type | TEXT | 终端类型：windows-terminal/tabby/xshell |
| command_template | TEXT | 启动命令模板 |
| is_default | INTEGER | 是否默认 |

## 4. 功能模块

### 4.1 连接管理

- 新建连接（支持批量导入）
- 编辑连接
- 删除连接（支持级联删除关联标签）
- 克隆连接
- 连接分组
- 连接排序

### 4.2 标签系统

- 创建标签（自定义颜色）
- 编辑标签
- 删除标签
- 标签筛选（多选）
- 标签颜色统计

### 4.3 分组管理

- 创建分组（支持树形嵌套）
- 编辑分组
- 删除分组
- 拖拽移动连接

### 4.4 搜索筛选

- 全文搜索（名称/主机/用户名/备注）
- 标签筛选
- 分组筛选
- 认证类型筛选
- 组合筛选

### 4.5 终端对接

#### Windows Terminal

```bash
wt.exe new-tab --window 0 ssh user@host -p port
```

#### Tabby

```bash
tabby://ssh/user@host:port
```

#### Xshell

```bash
xshell.exe -url ssh://user@host:port
```

## 5. 开发阶段

### 第一阶段：资源管理（当前阶段）

**目标**：完成连接信息的增删改查、分组、标签、搜索基本功能

**交付物**：
- [ ] SQLite 数据库初始化脚本
- [ ] 连接 CRUD 接口
- [ ] 标签管理接口
- [ ] 分组管理接口
- [ ] 前端列表页
- [ ] 前端编辑弹窗
- [ ] 筛选与搜索

**里程碑**：用户可以在本地管理 SSH 连接信息

### 第二阶段：终端对接

**目标**：与选定的终端深度集成，实现一键连接

**终端候选**：
1. Windows Terminal（微软开源，推荐）
2. Tabby（功能丰富）

**交付物**：
- [ ] 终端配置管理
- [ ] 连接参数组装
- [ ] 密码/密钥安全传递方案
- [ ] 一键连接功能
- [ ] 连接成功/失败反馈

**里程碑**：选择连接后可自动打开终端并建连

### 第三阶段：多终端适配

**目标**：支持更多 SSH 客户端

**支持列表**：
- [ ] Xshell
- [ ] SecureCRT
- [ ] PuTTY

**交付物**：
- [ ] 终端抽象层
- [ ] 各终端适配器
- [ ] 配置导入/导出

## 6. 安全考虑

### 6.1 密码存储

- 使用 AES-256-GCM 加密敏感字段
- 密钥通过机器特征生成
- 不在日志中输出敏感信息

### 6.2 私钥保护

- 私钥文件路径不存储明文密码
- 私钥口令独立加密存储
- 支持 Windows Credential Manager 集成

### 6.3 传输安全

- 仅本地存储，无网络传输
- 建议配合 VPN 或堡垒机使用

## 7. 性能目标

| 指标 | 目标 |
|------|------|
| 连接数量 | 支持 1000+ 连接 |
| 启动时间 | < 2 秒 |
| 搜索响应 | < 100ms |
| 内存占用 | < 200MB |

## 8. 后续扩展方向

- 连接导入/导出（支持 Excel、CSV）
- 连接超时提醒
- 连接历史记录
- 双因素认证支持
- 密码强度检测
- 连接复制（快速创建相似连接）
- 批量操作（批量删除、批量移动分组）
