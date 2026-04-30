/**
 * IPC 处理器注册中心
 * 集中注册所有 IPC 通道处理器
 */
import { ipcMain } from 'electron'
import * as connectionRepo from '../database/repositories/connectionRepository'
import * as tagRepo from '../database/repositories/tagRepository'
import * as groupRepo from '../database/repositories/groupRepository'
import * as terminalRepo from '../database/repositories/terminalConfigRepository'
import { setCustomDbPath, getCurrentDbPath } from '../database/index'

/**
 * 注册所有 IPC 处理器
 * 在应用启动时调用
 */
export function registerIpcHandlers(): void {
  registerConnectionHandlers()
  registerTagHandlers()
  registerGroupHandlers()
  registerTerminalConfigHandlers()
  registerDatabaseHandlers()
}

/**
 * 连接管理 IPC
 */
function registerConnectionHandlers(): void {
  ipcMain.handle('connection:create', (_event, input) => {
    return connectionRepo.createConnection(input)
  })

  ipcMain.handle('connection:create-batch', (_event, input) => {
    return connectionRepo.createConnections(input)
  })

  ipcMain.handle('connection:getById', (_event, id: string) => {
    return connectionRepo.getConnectionById(id)
  })

  ipcMain.handle('connection:getAll', () => {
    return connectionRepo.getAllConnections()
  })

  ipcMain.handle('connection:search', (_event, keyword: string) => {
    return connectionRepo.searchConnections(keyword)
  })

  ipcMain.handle('connection:update', (_event, id: string, input) => {
    return connectionRepo.updateConnection(id, input)
  })

  ipcMain.handle('connection:delete', (_event, id: string) => {
    return connectionRepo.deleteConnection(id)
  })
}

/**
 * 标签管理 IPC
 */
function registerTagHandlers(): void {
  ipcMain.handle('tag:create', (_event, input) => {
    return tagRepo.createTag(input)
  })

  ipcMain.handle('tag:getById', (_event, id: string) => {
    return tagRepo.getTagById(id)
  })

  ipcMain.handle('tag:getAll', () => {
    return tagRepo.getAllTags()
  })

  ipcMain.handle('tag:update', (_event, id: string, input) => {
    return tagRepo.updateTag(id, input)
  })

  ipcMain.handle('tag:delete', (_event, id: string) => {
    return tagRepo.deleteTag(id)
  })

  ipcMain.handle('tag:addToConnection', (_event, connectionId: string, tagId: string) => {
    tagRepo.addTagToConnection(connectionId, tagId)
    return true
  })

  ipcMain.handle('tag:removeFromConnection', (_event, connectionId: string, tagId: string) => {
    return tagRepo.removeTagFromConnection(connectionId, tagId)
  })

  ipcMain.handle('tag:getByConnectionId', (_event, connectionId: string) => {
    return tagRepo.getTagsByConnectionId(connectionId)
  })
}

/**
 * 分组管理 IPC
 */
function registerGroupHandlers(): void {
  ipcMain.handle('group:create', (_event, input) => {
    return groupRepo.createGroup(input)
  })

  ipcMain.handle('group:getById', (_event, id: string) => {
    return groupRepo.getGroupById(id)
  })

  ipcMain.handle('group:getAll', () => {
    return groupRepo.getAllGroups()
  })

  ipcMain.handle('group:getRoots', () => {
    return groupRepo.getRootGroups()
  })

  ipcMain.handle('group:getChildren', (_event, parentId: string) => {
    return groupRepo.getChildGroups(parentId)
  })

  ipcMain.handle('group:update', (_event, id: string, input) => {
    return groupRepo.updateGroup(id, input)
  })

  ipcMain.handle('group:delete', (_event, id: string) => {
    return groupRepo.deleteGroup(id)
  })
}

/**
 * 终端配置 IPC
 */
function registerTerminalConfigHandlers(): void {
  ipcMain.handle('terminalConfig:create', (_event, input) => {
    return terminalRepo.createTerminalConfig(input)
  })

  ipcMain.handle('terminalConfig:getById', (_event, id: string) => {
    return terminalRepo.getTerminalConfigById(id)
  })

  ipcMain.handle('terminalConfig:getAll', () => {
    return terminalRepo.getAllTerminalConfigs()
  })

  ipcMain.handle('terminalConfig:getDefault', () => {
    return terminalRepo.getDefaultTerminalConfig()
  })

  ipcMain.handle('terminalConfig:update', (_event, id: string, input) => {
    return terminalRepo.updateTerminalConfig(id, input)
  })

  ipcMain.handle('terminalConfig:delete', (_event, id: string) => {
    return terminalRepo.deleteTerminalConfig(id)
  })
}

/**
 * 数据库管理 IPC
 */
function registerDatabaseHandlers(): void {
  ipcMain.handle('database:setPath', (_event, path: string) => {
    setCustomDbPath(path)
    return true
  })

  ipcMain.handle('database:getPath', () => {
    return getCurrentDbPath()
  })
}
