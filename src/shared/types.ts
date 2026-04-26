/**
 * 共享类型定义
 * 主进程和渲染进程共用
 */

// 认证类型
export const AuthType = {
  PASSWORD: 'password',
  PUBLIC_KEY: 'publickey',
  AGENT: 'agent'
} as const
export type AuthType = typeof AuthType[keyof typeof AuthType]

// 终端类型
export const TerminalType = {
  WINDOWS_TERMINAL: 'windows-terminal',
  TABBY: 'tabby',
  XSHELL: 'xshell',
  SECURECRT: 'securecrt',
  PUTTY: 'putty'
} as const
export type TerminalType = typeof TerminalType[keyof typeof TerminalType]

// 连接记录
export interface Connection {
  id: string
  name: string
  host: string
  port: number
  username: string
  authType: AuthType
  password?: string
  privateKeyPath?: string
  passphrase?: string
  groupId?: string
  description?: string
  createdAt: string
  updatedAt: string
}

// 标签
export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

// 分组
export interface Group {
  id: string
  name: string
  parentId?: string
  createdAt: string
}

// 终端配置
export interface TerminalConfig {
  id: string
  name: string
  type: TerminalType
  commandTemplate: string
  isDefault: boolean
}
