/**
 * 标签数据访问层
 * 封装 tags 和 connection_tags 表的 CRUD 操作
 */
import { getDatabase } from '../index'

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface CreateTagInput {
  id: string
  name: string
  color?: string
}

export interface UpdateTagInput {
  name?: string
  color?: string
}

/**
 * 创建标签
 */
export function createTag(input: CreateTagInput): Tag {
  const db = getDatabase()

  const stmt = db.prepare(
    'INSERT INTO tags (id, name, color) VALUES (?, ?, ?)'
  )
  stmt.run(input.id, input.name, input.color ?? '#1890ff')

  return getTagById(input.id)!
}

/**
 * 根据 ID 获取标签
 */
export function getTagById(id: string): Tag | null {
  const db = getDatabase()

  const row = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined

  if (!row) return null
  return mapRowToTag(row)
}

/**
 * 获取所有标签
 */
export function getAllTags(): Tag[] {
  const db = getDatabase()

  const rows = db
    .prepare('SELECT * FROM tags ORDER BY created_at DESC')
    .all() as Record<string, unknown>[]

  return rows.map(mapRowToTag)
}

/**
 * 更新标签
 */
export function updateTag(id: string, input: UpdateTagInput): Tag {
  const db = getDatabase()

  const sets: string[] = []
  const values: unknown[] = []

  if (input.name !== undefined) {
    sets.push('name = ?')
    values.push(input.name)
  }
  if (input.color !== undefined) {
    sets.push('color = ?')
    values.push(input.color)
  }

  if (sets.length === 0) {
    return getTagById(id)!
  }

  values.push(id)
  db.prepare(`UPDATE tags SET ${sets.join(', ')} WHERE id = ?`).run(...values)

  return getTagById(id)!
}

/**
 * 删除标签
 * 关联的 connection_tags 会自动级联删除
 */
export function deleteTag(id: string): boolean {
  const db = getDatabase()

  const result = db.prepare('DELETE FROM tags WHERE id = ?').run(id)
  return result.changes > 0
}

/**
 * 为连接添加标签
 */
export function addTagToConnection(connectionId: string, tagId: string): void {
  const db = getDatabase()

  db.prepare(
    'INSERT OR IGNORE INTO connection_tags (connection_id, tag_id) VALUES (?, ?)'
  ).run(connectionId, tagId)
}

/**
 * 移除连接的标签
 */
export function removeTagFromConnection(
  connectionId: string,
  tagId: string
): boolean {
  const db = getDatabase()

  const result = db
    .prepare(
      'DELETE FROM connection_tags WHERE connection_id = ? AND tag_id = ?'
    )
    .run(connectionId, tagId)

  return result.changes > 0
}

/**
 * 获取连接的所有标签
 */
export function getTagsByConnectionId(connectionId: string): Tag[] {
  const db = getDatabase()

  const rows = db
    .prepare(
      `SELECT t.* FROM tags t
       INNER JOIN connection_tags ct ON t.id = ct.tag_id
       WHERE ct.connection_id = ?
       ORDER BY t.created_at DESC`
    )
    .all(connectionId) as Record<string, unknown>[]

  return rows.map(mapRowToTag)
}

/**
 * 获取标签关联的所有连接 ID
 */
export function getConnectionIdsByTagId(tagId: string): string[] {
  const db = getDatabase()

  const rows = db
    .prepare('SELECT connection_id FROM connection_tags WHERE tag_id = ?')
    .all(tagId) as Record<string, unknown>[]

  return rows.map((row) => row.connection_id as string)
}

function mapRowToTag(row: Record<string, unknown>): Tag {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
    createdAt: row.created_at as string
  }
}
