/**
 * 连接数据访问层
 * 封装 connections 表的 CRUD 操作
 */
import { getDatabase } from '../index'
import { encrypt, decrypt } from '../../services/cryptoService'

export interface Connection {
  id: string
  name: string
  host: string
  port: number
  username: string
  authType: 'password' | 'publickey' | 'agent'
  password?: string
  privateKeyPath?: string
  passphrase?: string
  groupId?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateConnectionInput {
  id: string
  name: string
  host: string
  port?: number
  username: string
  authType: 'password' | 'publickey' | 'agent'
  password?: string
  privateKeyPath?: string
  passphrase?: string
  groupId?: string
  description?: string
}

export interface UpdateConnectionInput {
  name?: string
  host?: string
  port?: number
  username?: string
  authType?: 'password' | 'publickey' | 'agent'
  password?: string
  privateKeyPath?: string
  passphrase?: string
  groupId?: string
  description?: string
}

/**
 * 创建连接记录
 */
export function createConnection(input: CreateConnectionInput): Connection {
  const db = getDatabase()

  const stmt = db.prepare(
    `INSERT INTO connections (
      id, name, host, port, username, auth_type,
      password_encrypted, private_key_path, passphrase_encrypted,
      group_id, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )

  stmt.run(
    input.id,
    input.name,
    input.host,
    input.port ?? 22,
    input.username,
    input.authType,
    input.password ? encrypt(input.password) : null,
    input.privateKeyPath ?? null,
    input.passphrase ? encrypt(input.passphrase) : null,
    input.groupId ?? null,
    input.description ?? null
  )

  return getConnectionById(input.id)!
}

/**
 * 根据 ID 获取连接
 */
export function getConnectionById(id: string): Connection | null {
  const db = getDatabase()

  const row = db
    .prepare(
      `SELECT
        id, name, host, port, username, auth_type,
        password_encrypted, private_key_path, passphrase_encrypted,
        group_id, description, created_at, updated_at
      FROM connections WHERE id = ?`
    )
    .get(id) as Record<string, unknown> | undefined

  if (!row) {
    return null
  }

  return mapRowToConnection(row)
}

/**
 * 获取所有连接列表
 */
export function getAllConnections(): Connection[] {
  const db = getDatabase()

  const rows = db
    .prepare(
      `SELECT
        id, name, host, port, username, auth_type,
        password_encrypted, private_key_path, passphrase_encrypted,
        group_id, description, created_at, updated_at
      FROM connections ORDER BY created_at DESC`
    )
    .all() as Record<string, unknown>[]

  return rows.map(mapRowToConnection)
}

/**
 * 搜索连接
 * 支持名称、主机、用户名、备注模糊搜索
 */
export function searchConnections(keyword: string): Connection[] {
  const db = getDatabase()

  const like = `%${keyword}%`
  const rows = db
    .prepare(
      `SELECT
        id, name, host, port, username, auth_type,
        password_encrypted, private_key_path, passphrase_encrypted,
        group_id, description, created_at, updated_at
      FROM connections
      WHERE name LIKE ? OR host LIKE ? OR username LIKE ? OR description LIKE ?
      ORDER BY created_at DESC`
    )
    .all(like, like, like, like) as Record<string, unknown>[]

  return rows.map(mapRowToConnection)
}

/**
 * 更新连接
 */
export function updateConnection(
  id: string,
  input: UpdateConnectionInput
): Connection {
  const db = getDatabase()

  const sets: string[] = []
  const values: unknown[] = []

  if (input.name !== undefined) {
    sets.push('name = ?')
    values.push(input.name)
  }
  if (input.host !== undefined) {
    sets.push('host = ?')
    values.push(input.host)
  }
  if (input.port !== undefined) {
    sets.push('port = ?')
    values.push(input.port)
  }
  if (input.username !== undefined) {
    sets.push('username = ?')
    values.push(input.username)
  }
  if (input.authType !== undefined) {
    sets.push('auth_type = ?')
    values.push(input.authType)
  }
  if (input.password !== undefined) {
    sets.push('password_encrypted = ?')
    values.push(input.password ? encrypt(input.password) : null)
  }
  if (input.privateKeyPath !== undefined) {
    sets.push('private_key_path = ?')
    values.push(input.privateKeyPath)
  }
  if (input.passphrase !== undefined) {
    sets.push('passphrase_encrypted = ?')
    values.push(input.passphrase ? encrypt(input.passphrase) : null)
  }
  if (input.groupId !== undefined) {
    sets.push('group_id = ?')
    values.push(input.groupId)
  }
  if (input.description !== undefined) {
    sets.push('description = ?')
    values.push(input.description)
  }

  if (sets.length === 0) {
    return getConnectionById(id)!
  }

  sets.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  const stmt = db.prepare(
    `UPDATE connections SET ${sets.join(', ')} WHERE id = ?`
  )
  stmt.run(...values)

  return getConnectionById(id)!
}

/**
 * 删除连接
 */
export function deleteConnection(id: string): boolean {
  const db = getDatabase()

  const result = db.prepare('DELETE FROM connections WHERE id = ?').run(id)
  return result.changes > 0
}

/**
 * 数据库行映射为 Connection 对象
 */
function mapRowToConnection(row: Record<string, unknown>): Connection {
  return {
    id: row.id as string,
    name: row.name as string,
    host: row.host as string,
    port: row.port as number,
    username: row.username as string,
    authType: row.auth_type as 'password' | 'publickey' | 'agent',
    password: row.password_encrypted
      ? decrypt(row.password_encrypted as string)
      : undefined,
    privateKeyPath: (row.private_key_path as string) ?? undefined,
    passphrase: row.passphrase_encrypted
      ? decrypt(row.passphrase_encrypted as string)
      : undefined,
    groupId: (row.group_id as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  }
}
