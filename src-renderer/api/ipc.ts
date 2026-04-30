/**
 * IPC 调用封装
 * 提供类型安全的 IPC 调用接口
 */
import type {
  Connection,
  Tag,
  Group,
  TerminalConfig,
  AuthType
} from '../../shared/types'

const api = window.electronAPI

function isElectron(): boolean {
  return !!api
}

export { isElectron }

// 连接管理 API
export async function createConnection(input: {
  id: string
  name: string
  host: string
  port?: number
  username: string
  authType: AuthType
  password?: string
  privateKeyPath?: string
  passphrase?: string
  groupId?: string
  description?: string
}): Promise<Connection> {
  if (!isElectron()) return [] as unknown as Connection
  return api.createConnection(input) as Promise<Connection>
}

export async function createConnections(input: {
  id: string
  name: string
  host: string
  port?: number
  username: string
  authType: AuthType
  password?: string
  privateKeyPath?: string
  passphrase?: string
  groupId?: string
  description?: string
}[]): Promise<Connection[]> {
  if (!isElectron()) return [] as unknown as Connection[]
  return api.createConnections(input) as Promise<Connection[]>
}

/**
 * 数据库管理 API
 */
export async function setDatabasePath(path: string): Promise<boolean> {
  if (!isElectron()) return false
  return api.setDatabasePath(path) as Promise<boolean>
}

export async function getDatabasePath(): Promise<string> {
  if (!isElectron()) return ''
  return api.getPath() as Promise<string>
}

export async function getConnectionById(id: string): Promise<Connection | null> {
  if (!isElectron()) return null
  return api.getConnectionById(id) as Promise<Connection | null>
}

export async function getAllConnections(): Promise<Connection[]> {
  if (!isElectron()) return []
  return api.getAllConnections() as Promise<Connection[]>
}

export async function searchConnections(keyword: string): Promise<Connection[]> {
  if (!isElectron()) return []
  return api.searchConnections(keyword) as Promise<Connection[]>
}

export async function updateConnection(
  id: string,
  input: Partial<Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Connection> {
  if (!isElectron()) return {} as Connection
  return api.updateConnection(id, input) as Promise<Connection>
}

export async function deleteConnection(id: string): Promise<boolean> {
  if (!isElectron()) return false
  return api.deleteConnection(id) as Promise<boolean>
}

export async function cloneConnection(id: string): Promise<Connection | null> {
  if (!isElectron()) return null
  return api.cloneConnection(id) as Promise<Connection | null>
}

// 标签管理 API
export async function createTag(input: {
  id: string
  name: string
  color?: string
}): Promise<Tag> {
  if (!isElectron()) return {} as Tag
  return api.createTag(input) as Promise<Tag>
}

export async function getTagById(id: string): Promise<Tag | null> {
  if (!isElectron()) return null
  return api.getTagById(id) as Promise<Tag | null>
}

export async function getAllTags(): Promise<Tag[]> {
  if (!isElectron()) return []
  return api.getAllTags() as Promise<Tag[]>
}

export async function updateTag(
  id: string,
  input: Partial<Pick<Tag, 'name' | 'color'>>
): Promise<Tag> {
  if (!isElectron()) return {} as Tag
  return api.updateTag(id, input) as Promise<Tag>
}

export async function deleteTag(id: string): Promise<boolean> {
  if (!isElectron()) return false
  return api.deleteTag(id) as Promise<boolean>
}

export async function addTagToConnection(
  connectionId: string,
  tagId: string
): Promise<void> {
  if (!isElectron()) return
  await api.addTagToConnection(connectionId, tagId)
}

export async function removeTagFromConnection(
  connectionId: string,
  tagId: string
): Promise<boolean> {
  if (!isElectron()) return false
  return api.removeTagFromConnection(connectionId, tagId) as Promise<boolean>
}

export async function getTagsByConnectionId(connectionId: string): Promise<Tag[]> {
  if (!isElectron()) return []
  return api.getTagsByConnectionId(connectionId) as Promise<Tag[]>
}

// 分组管理 API
export async function createGroup(input: {
  id: string
  name: string
  parentId?: string
}): Promise<Group> {
  if (!isElectron()) return {} as Group
  return api.createGroup(input) as Promise<Group>
}

export async function getGroupById(id: string): Promise<Group | null> {
  if (!isElectron()) return null
  return api.getGroupById(id) as Promise<Group | null>
}

export async function getAllGroups(): Promise<Group[]> {
  if (!isElectron()) return []
  return api.getAllGroups() as Promise<Group[]>
}

export async function getRootGroups(): Promise<Group[]> {
  if (!isElectron()) return []
  return api.getRootGroups() as Promise<Group[]>
}

export async function getChildGroups(parentId: string): Promise<Group[]> {
  if (!isElectron()) return []
  return api.getChildGroups(parentId) as Promise<Group[]>
}

export async function updateGroup(
  id: string,
  input: Partial<Pick<Group, 'name' | 'parentId'>>
): Promise<Group> {
  if (!isElectron()) return {} as Group
  return api.updateGroup(id, input) as Promise<Group>
}

export async function deleteGroup(id: string): Promise<boolean> {
  if (!isElectron()) return false
  return api.deleteGroup(id) as Promise<boolean>
}

export async function getGroupTree(): Promise<Group[]> {
  if (!isElectron()) return []
  return api.getGroupTree() as Promise<Group[]>
}

// 终端配置 API
export async function createTerminalConfig(input: {
  id: string
  name: string
  type: TerminalConfig['type']
  commandTemplate: string
  isDefault?: boolean
}): Promise<TerminalConfig> {
  if (!isElectron()) return {} as TerminalConfig
  return api.createTerminalConfig(input) as Promise<TerminalConfig>
}

export async function getTerminalConfigById(id: string): Promise<TerminalConfig | null> {
  if (!isElectron()) return null
  return api.getTerminalConfigById(id) as Promise<TerminalConfig | null>
}

export async function getAllTerminalConfigs(): Promise<TerminalConfig[]> {
  if (!isElectron()) return []
  return api.getAllTerminalConfigs() as Promise<TerminalConfig[]>
}

export async function getDefaultTerminalConfig(): Promise<TerminalConfig | null> {
  if (!isElectron()) return null
  return api.getDefaultTerminalConfig() as Promise<TerminalConfig | null>
}

export async function updateTerminalConfig(
  id: string,
  input: Partial<Omit<TerminalConfig, 'id'>>
): Promise<TerminalConfig> {
  if (!isElectron()) return {} as TerminalConfig
  return api.updateTerminalConfig(id, input) as Promise<TerminalConfig>
}

export async function deleteTerminalConfig(id: string): Promise<boolean> {
  if (!isElectron()) return false
  return api.deleteTerminalConfig(id) as Promise<boolean>
}
