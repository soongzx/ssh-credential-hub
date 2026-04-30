# 项目交付产物目录结构

## 目录说明

### `dist/`
- 前端构建输出目录
- 包含 Vue.js 前端应用的打包文件
- 用于 Electron 应用的渲染进程

### `dist-electron/`
- Electron 主进程构建输出目录
- 包含 Node.js 服务端代码的打包文件
- 包含主进程入口文件 `main.js`

### `release/`
- 最终构建的可执行文件输出目录
- 包含 Windows 可执行文件（.exe）
- 包含安装程序文件（如果配置了）

## 构建流程

```bash
# 开发模式运行
npm run dev

# 生产构建
npm run build

# 构建 Windows 可执行文件
npm run build:exe
```

## 交付产物

1. **开发构建产物**：
   - `dist/` - 前端构建产物
   - `dist-electron/` - 主进程构建产物

2. **发布产物**：
   - `release/SSH Credential Hub.exe` - Windows 可执行文件
   - 安装程序（如配置）

## 目录结构示例

```
ssh-credential-hub/
├── dist/                 # 前端构建输出
│   ├── index.html
│   ├── assets/
│   └── js/
├── dist-electron/        # Electron 主进程构建输出
│   └── main.js
├── release/              # 发布产物目录
│   └── SSH Credential Hub.exe
├── src-electron/         # Electron 主进程源码
├── src-renderer/         # Vue 前端源码
└── package.json
```

## 使用说明

- 构建后，所有交付产物都会自动输出到对应目录
- Windows 用户可直接运行 `release/SSH Credential Hub.exe`
- 开发者可使用 `npm run dev` 进行开发调试