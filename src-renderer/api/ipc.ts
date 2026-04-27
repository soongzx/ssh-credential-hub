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

// 获取 window.electronAPI 实例
const api = window.electronAPI

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
  return api.createConnection(input) as Promise<Connection>
}

export async function getConnectionById(id: string): Promise<Connection | null> {
  return api.getConnectionById(id) as Promise<Connection | null>
}

export async function getAllConnections(): Promise<Connection[]> {
  return api.getAllConnections() as Promise<Connection[]>
}

export async function searchConnections(keyword: string): Promise<Connection[]> {
  return api.searchConnections(keyword) as Promise<Connection[]>
}

export async function updateConnection(
  id: string,
  input: Partial<Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Connection> {
  return api.updateConnection(id, input) as Promise<Connection>
}

export async function deleteConnection(id: string): Promise<boolean> {
  return api.deleteConnection(id) as Promise<boolean>
}

// 标签管理 API
export async function createTag(input: {
  id: string
  name: string
  color?: string
}): Promise<Tag> {
  return api.createTag(input) as Promise<Tag>
}

export async function getTagById(id: string): Promise<Tag | null> {
  return api.getTagById(id) as Promise<Tag | null>
}

export async function getAllTags(): Promise<Tag[]> {
  return api.getAllTags() as Promise<Tag[]>
}

export async function updateTag(
  id: string,
  input: Partial<Pick<Tag, 'name' | 'color'>>
): Promise<Tag> {
  return api.updateTag(id, input) as Promise<Tag>
}

export async function deleteTag(id: string): Promise<boolean> {
  return api.deleteTag(id) as Promise<boolean>
}

export async function addTagToConnection(
  connectionId: string,
  tagId: string
): Promise<void> {
  await api.addTagToConnection(connectionId, tagId)
}

export async function removeTagFromConnection(
  connectionId: string,
  tagId: string
): Promise<boolean> {
  return api.removeTagFromConnection(connectionId, tagId) as Promise<boolean>
}

export async function getTagsByConnectionId(connectionId: string): Promise<Tag[]> {
  return api.getTagsByConnectionId(connectionId) as Promise<Tag[]>
}

// 分组管理 API
export async function createGroup(input: {
  id: string
  name: string
  parentId?: string
}): Promise<Group> {
  return api.createGroup(input) as Promise<Group>
}

export async function getGroupById(id: string): Promise<Group | null> {
  return api.getGroupById(id) as Promise<Group | null>
}

export async function getAllGroups(): Promise<Group[]> {
  return api.getAllGroups() as Promise<Group[]>
}

export async function getRootGroups(): Promise<Group[]> {
  return api.getRootGroups() as Promise<Group[]>
}

export async function getChildGroups(parentId: string): Promise<Group[]> {
  return api.getChildGroups(parentId) as Promise<Group[]>
}

export async function updateGroup(
  id: string,
  input: Partial<Pick<Group, 'name' | 'parentId'>>
): Promise<Group> {
  return api.updateGroup(id, input) as Promise<Group>
}

export async function deleteGroup(id: string): Promise<boolean> {
  return api.deleteGroup(id) as Promise<boolean>
}

// 终端配置 API
export async function createTerminalConfig(input: {
  id: string
  name: string
  type: TerminalConfig['type']
  commandTemplate: string
  isDefault?: boolean
}): Promise<TerminalConfig> {
  return api.createTerminalConfig(input) as Promise<TerminalConfig>
}

export async function getTerminalConfigById(id: string): Promise<TerminalConfig | null> {
  return api.getTerminalConfigById(id) as Promise<TerminalConfig | null>
}

export async function getAllTerminalConfigs(): Promise<TerminalConfig[]> {
  return api.getAllTerminalConfigs() as Promise<TerminalConfig[]>
}

export async function getDefaultTerminalConfig(): Promise<TerminalConfig | null> {
  return api.getDefaultTerminalConfig() as Promise<TerminalConfig | null>
}

export async function updateTerminalConfig(
  id: string,
  input: Partial<Omit<TerminalConfig, 'id'>>
): Promise<TerminalConfig> {
  return api.updateTerminalConfig(id, input) as Promise<TerminalConfig>
}

export async function deleteTerminalConfig(id: string): Promise<boolean> {
  return api.deleteTerminalConfig(id) as Promise<boolean>
}
