import { contextBridge, ipcRenderer } from 'electron'

/**
 * IPC 通道类型定义
 * 与主进程 ipc/index.ts 中的注册保持一致
 */
interface ElectronAPI {
  platform: string

  // 连接管理
  createConnection: (input: unknown) => Promise<unknown>
  getConnectionById: (id: string) => Promise<unknown>
  getAllConnections: () => Promise<unknown>
  searchConnections: (keyword: string) => Promise<unknown>
  updateConnection: (id: string, input: unknown) => Promise<unknown>
  deleteConnection: (id: string) => Promise<unknown>

  // 标签管理
  createTag: (input: unknown) => Promise<unknown>
  getTagById: (id: string) => Promise<unknown>
  getAllTags: () => Promise<unknown>
  updateTag: (id: string, input: unknown) => Promise<unknown>
  deleteTag: (id: string) => Promise<unknown>
  addTagToConnection: (connectionId: string, tagId: string) => Promise<unknown>
  removeTagFromConnection: (connectionId: string, tagId: string) => Promise<unknown>
  getTagsByConnectionId: (connectionId: string) => Promise<unknown>

  // 分组管理
  createGroup: (input: unknown) => Promise<unknown>
  getGroupById: (id: string) => Promise<unknown>
  getAllGroups: () => Promise<unknown>
  getRootGroups: () => Promise<unknown>
  getChildGroups: (parentId: string) => Promise<unknown>
  updateGroup: (id: string, input: unknown) => Promise<unknown>
  deleteGroup: (id: string) => Promise<unknown>

  // 终端配置
  createTerminalConfig: (input: unknown) => Promise<unknown>
  getTerminalConfigById: (id: string) => Promise<unknown>
  getAllTerminalConfigs: () => Promise<unknown>
  getDefaultTerminalConfig: () => Promise<unknown>
  updateTerminalConfig: (id: string, input: unknown) => Promise<unknown>
  deleteTerminalConfig: (id: string) => Promise<unknown>
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // 连接管理
  createConnection: (input: unknown) => ipcRenderer.invoke('connection:create', input),
  getConnectionById: (id: string) => ipcRenderer.invoke('connection:getById', id),
  getAllConnections: () => ipcRenderer.invoke('connection:getAll'),
  searchConnections: (keyword: string) => ipcRenderer.invoke('connection:search', keyword),
  updateConnection: (id: string, input: unknown) => ipcRenderer.invoke('connection:update', id, input),
  deleteConnection: (id: string) => ipcRenderer.invoke('connection:delete', id),

  // 标签管理
  createTag: (input: unknown) => ipcRenderer.invoke('tag:create', input),
  getTagById: (id: string) => ipcRenderer.invoke('tag:getById', id),
  getAllTags: () => ipcRenderer.invoke('tag:getAll'),
  updateTag: (id: string, input: unknown) => ipcRenderer.invoke('tag:update', id, input),
  deleteTag: (id: string) => ipcRenderer.invoke('tag:delete', id),
  addTagToConnection: (connectionId: string, tagId: string) =>
    ipcRenderer.invoke('tag:addToConnection', connectionId, tagId),
  removeTagFromConnection: (connectionId: string, tagId: string) =>
    ipcRenderer.invoke('tag:removeFromConnection', connectionId, tagId),
  getTagsByConnectionId: (connectionId: string) =>
    ipcRenderer.invoke('tag:getByConnectionId', connectionId),

  // 分组管理
  createGroup: (input: unknown) => ipcRenderer.invoke('group:create', input),
  getGroupById: (id: string) => ipcRenderer.invoke('group:getById', id),
  getAllGroups: () => ipcRenderer.invoke('group:getAll'),
  getRootGroups: () => ipcRenderer.invoke('group:getRoots'),
  getChildGroups: (parentId: string) => ipcRenderer.invoke('group:getChildren', parentId),
  updateGroup: (id: string, input: unknown) => ipcRenderer.invoke('group:update', id, input),
  deleteGroup: (id: string) => ipcRenderer.invoke('group:delete', id),

  // 终端配置
  createTerminalConfig: (input: unknown) => ipcRenderer.invoke('terminalConfig:create', input),
  getTerminalConfigById: (id: string) => ipcRenderer.invoke('terminalConfig:getById', id),
  getAllTerminalConfigs: () => ipcRenderer.invoke('terminalConfig:getAll'),
  getDefaultTerminalConfig: () => ipcRenderer.invoke('terminalConfig:getDefault'),
  updateTerminalConfig: (id: string, input: unknown) => ipcRenderer.invoke('terminalConfig:update', id, input),
  deleteTerminalConfig: (id: string) => ipcRenderer.invoke('terminalConfig:delete', id)
} as ElectronAPI)
