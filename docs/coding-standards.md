# SSH Credential Hub - 编码规范

## 1. 语言与框架规范

### 1.1 TypeScript

- **严格模式启用**：`tsconfig.json` 中启用 `strict: true`
- **禁止隐式 any**：所有函数参数和返回值必须显式声明类型
- **优先使用接口（interface）**：定义数据模型时使用 `interface` 而非 `type`
- **枚举使用常量对象**：优先使用 `as const` 对象替代 `enum`

```typescript
// 推荐
const AuthType = {
  PASSWORD: 'password',
  PUBLIC_KEY: 'publickey',
  AGENT: 'agent'
} as const;
type AuthType = typeof AuthType[keyof typeof AuthType];

// 不推荐
enum AuthTypeEnum {
  PASSWORD = 'password',
  PUBLIC_KEY = 'publickey',
  AGENT = 'agent'
}
```

### 1.2 Vue 3

- **Composition API 唯一**：所有组件使用 `<script setup>` 语法
- **禁止 Options API**：保持代码风格统一
- **Props 显式定义**：使用 `defineProps` 并声明完整类型
- **Emits 显式声明**：使用 `defineEmits` 声明事件类型

```vue
<script setup lang="ts">
interface Props {
  connectionId: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
});

const emit = defineEmits<{
  (e: 'update', id: string): void;
  (e: 'delete', id: string): void;
}>();
</script>
```

## 2. 命名规范

### 2.1 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `ConnectionList.vue` |
| 组合式函数 | camelCase，以 use 开头 | `useConnectionStore.ts` |
| 工具函数 | camelCase | `cryptoUtils.ts` |
| 常量 | UPPER_SNAKE_CASE | `DATABASE_VERSION.ts` |
| 类型定义 | PascalCase | `Connection.ts` |
| IPC 通道 | kebab-case | `connection-create` |

### 2.2 变量与函数命名

- **布尔值**：以 `is`、`has`、`can`、`should` 开头
  - `isLoading`, `hasPassword`, `canEdit`
- **数组/列表**：以复数形式命名
  - `connections`, `tags`, `groupList`
- **事件处理函数**：以 `handle` 开头
  - `handleSubmit`, `handleDelete`
- **获取数据函数**：以 `fetch` 或 `get` 开头
  - `fetchConnections`, `getConnectionById`
- **异步函数**：以动词开头，明确操作
  - `createConnection`, `updateTag`, `deleteGroup`

## 3. 代码风格

### 3.1 格式化

- **缩进**：2 个空格
- **引号**：单引号（字符串），反引号（模板字符串）
- **分号**：必须添加
- **最大行宽**：100 字符
- **尾随逗号**：多行对象/数组必须添加

### 3.2 导入顺序

按以下顺序分组，组间空行分隔：

1. 外部依赖（Vue, Electron 等）
2. 内部类型定义
3. 组合式函数/工具函数
4. 组件

```typescript
import { ref, computed } from 'vue';
import { ipcRenderer } from 'electron';

import type { Connection } from '../types/Connection';

import { useConnectionStore } from '../stores/useConnectionStore';
import { encryptField } from '../utils/cryptoUtils';

import ConnectionCard from '../components/ConnectionCard.vue';
```

### 3.3 注释规范

- **JSDoc**：所有公共函数必须添加 JSDoc 注释
- **行内注释**：仅在复杂逻辑处添加，说明"为什么"而非"做什么"
- **TODO 标记**：使用 `TODO:` 并附带作者和日期

```typescript
/**
 * 使用 AES-256-GCM 加密敏感字段
 * @param plaintext - 待加密的明文
 * @returns 包含 iv 和 authTag 的加密结果字符串
 */
function encryptField(plaintext: string): string {
  // TODO: 考虑添加密钥轮换机制 (2026-04-26)
  const iv = crypto.randomBytes(16);
  // ...
}
```

## 4. 项目结构规范

### 4.1 目录组织

```
src/
├── main/                    # Electron 主进程
│   ├── main.ts             # 入口文件
│   ├── database/           # 数据库相关
│   │   ├── index.ts        # 数据库连接初始化
│   │   ├── migrations/     # 迁移脚本
│   │   └── repositories/   # 数据访问层
│   ├── services/           # 业务服务层
│   │   ├── cryptoService.ts
│   │   └── sshLauncherService.ts
│   └── ipc/                # IPC 处理器
│       ├── connectionIpc.ts
│       ├── tagIpc.ts
│       └── groupIpc.ts
├── preload/                # 预加载脚本
│   └── index.ts
├── renderer/               # 前端渲染进程
│   ├── main.ts             # Vue 应用入口
│   ├── App.vue
│   ├── types/              # 类型定义
│   ├── stores/             # Pinia 状态管理
│   ├── composables/        # 组合式函数
│   ├── utils/              # 工具函数
│   ├── views/              # 页面级组件
│   └── components/         # 可复用组件
│       ├── connection/
│       ├── tag/
│       └── common/
└── shared/                 # 主进程与渲染进程共享代码
    ├── constants.ts
    └── types.ts
```

### 4.2 模块边界

- **主进程**：禁止直接操作 DOM，禁止引入 Vue
- **渲染进程**：禁止直接访问 Node.js API（通过 preload 暴露）
- **共享代码**：仅存放纯类型定义和常量，禁止包含平台相关逻辑

## 5. 错误处理

### 5.1 原则

- **不静默吞掉错误**：所有异常必须处理或上报
- **用户友好**：用户可见的错误使用中文提示
- **日志记录**：所有错误必须记录到日志文件

### 5.2 错误类型

```typescript
// 定义业务错误类型
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
  }
}

// 使用示例
throw new AppError(
  'Database connection failed',
  'DB_CONNECTION_ERROR',
  '数据库连接失败，请检查数据文件是否损坏'
);
```

## 6. 性能规范

### 6.1 渲染性能

- **大数据列表**：超过 50 项必须使用虚拟滚动
- **防抖节流**：搜索输入 300ms 防抖，窗口 resize 100ms 节流
- **计算属性缓存**：复杂计算使用 `computed`，避免在模板中调用方法

### 6.2 数据库性能

- **批量操作**：使用事务包裹批量插入/更新
- **索引策略**：所有外键和频繁查询字段必须建立索引
- **查询限制**：列表查询默认限制 100 条，提供分页/加载更多

## 7. 安全规范

### 7.1 敏感数据处理

- **禁止硬编码密钥**：所有密钥通过运行时生成或环境变量传入
- **内存安全**：敏感数据使用后立即清空（`Buffer.fill(0)`）
- **日志脱敏**：日志中禁止输出密码、密钥路径等敏感信息

### 7.2 IPC 安全

- **输入校验**：所有 IPC 调用参数必须进行类型和范围校验
- **最小权限**：preload 脚本仅暴露必要的 API

```typescript
// preload 暴露示例
contextBridge.exposeInMainWorld('electronAPI', {
  // 明确声明参数类型
  createConnection: (data: unknown) => {
    // 运行时校验
    if (!isValidConnectionData(data)) {
      return Promise.reject(new Error('Invalid connection data'));
    }
    return ipcRenderer.invoke('connection-create', data);
  }
});
```

## 8. 测试规范

### 8.1 测试策略

| 类型 | 工具 | 范围 |
|------|------|------|
| 单元测试 | Vitest | 工具函数、组合式函数 |
| 组件测试 | Vue Test Utils + Vitest | 纯 UI 组件 |
| E2E 测试 | Playwright | 关键用户流程 |

### 8.2 测试文件位置

- 与源码同目录，以 `.test.ts` 或 `.spec.ts` 结尾
- 示例：`src/utils/cryptoUtils.ts` 对应 `src/utils/cryptoUtils.test.ts`

## 9. Git 提交规范

### 9.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 9.2 类型说明

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式调整（不影响功能） |
| refactor | 代码重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具链/依赖更新 |

### 9.3 示例

```
feat(connection): 添加连接批量导入功能

支持 CSV 和 Excel 格式导入，自动校验必填字段。
导入失败时返回详细错误列表。

Closes #123
```

## 10. 文档规范

### 10.1 代码文档

- 所有公共 API 必须有 JSDoc
- 复杂业务逻辑必须添加行内注释
- 组件必须说明 Props 和 Events

### 10.2 项目文档

- `docs/project-design.md` - 架构设计（变更需同步更新）
- `docs/coding-standards.md` - 本文件（变更需同步更新）
- `docs/architecture-decisions.md` - 架构决策记录
- `docs/todo.md` - 开发任务跟踪

---

> 最后更新：2026-04-26
> 生效版本：v0.1.0+
