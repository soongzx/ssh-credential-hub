/**
 * 共享常量
 * 主进程和渲染进程共用
 */

// 应用名称
export const APP_NAME = 'SSH Credential Hub'

// 默认 SSH 端口
export const DEFAULT_SSH_PORT = 22

// 默认标签颜色
export const DEFAULT_TAG_COLOR = '#1890ff'

// 数据库相关
export const DATABASE_FILE_NAME = 'app.db'

// IPC 通道前缀
export const IPC_CHANNELS = {
  CONNECTION: 'connection',
  TAG: 'tag',
  GROUP: 'group',
  TERMINAL_CONFIG: 'terminalConfig'
} as const
