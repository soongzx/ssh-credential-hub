/**
 * 分组数据访问层
 * 封装 groups 表的 CRUD 操作
 */
import { getDatabase } from '../index'

export interface Group {
  id: string
  name: string
  parentId?: string
  createdAt: string
}

export interface CreateGroupInput {
  id: string
  name: string
  parentId?: string
}

export interface UpdateGroupInput {
  name?: string
  parentId?: string
}

/**
 * 创建分组
 */
export function createGroup(input: CreateGroupInput): Group {
  const db = getDatabase()

  const stmt = db.prepare(
    'INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)'
  )
  stmt.run(input.id, input.name, input.parentId ?? null)

  return getGroupById(input.id)!
}

/**
 * 根据 ID 获取分组
 */
export function getGroupById(id: string): Group | null {
  const db = getDatabase()

  const row = db.prepare('SELECT * FROM groups WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined

  if (!row) return null
  return mapRowToGroup(row)
}

/**
 * 获取所有分组
 */
export function getAllGroups(): Group[] {
  const db = getDatabase()

  const rows = db
    .prepare('SELECT * FROM groups ORDER BY created_at DESC')
    .all() as Record<string, unknown>[]

  return rows.map(mapRowToGroup)
}

/**
 * 获取顶层分组（无父分组）
 */
export function getRootGroups(): Group[] {
  const db = getDatabase()

  const rows = db
    .prepare('SELECT * FROM groups WHERE parent_id IS NULL ORDER BY created_at DESC')
    .all() as Record<string, unknown>[]

  return rows.map(mapRowToGroup)
}

/**
 * 获取子分组
 */
export function getChildGroups(parentId: string): Group[] {
  const db = getDatabase()

  const rows = db
    .prepare('SELECT * FROM groups WHERE parent_id = ? ORDER BY created_at DESC')
    .all(parentId) as Record<string, unknown>[]

  return rows.map(mapRowToGroup)
}

/**
 * 更新分组
 */
export function updateGroup(id: string, input: UpdateGroupInput): Group {
  const db = getDatabase()

  const sets: string[] = []
  const values: unknown[] = []

  if (input.name !== undefined) {
    sets.push('name = ?')
    values.push(input.name)
  }
  if (input.parentId !== undefined) {
    sets.push('parent_id = ?')
    values.push(input.parentId)
  }

  if (sets.length === 0) {
    return getGroupById(id)!
  }

  values.push(id)
  db.prepare(`UPDATE groups SET ${sets.join(', ')} WHERE id = ?`).run(...values)

  return getGroupById(id)!
}

/**
 * 删除分组
 * 子分组和关联的连接会自动级联处理
 */
export function deleteGroup(id: string): boolean {
  const db = getDatabase()

  const result = db.prepare('DELETE FROM groups WHERE id = ?').run(id)
  return result.changes > 0
}

function mapRowToGroup(row: Record<string, unknown>): Group {
  return {
    id: row.id as string,
    name: row.name as string,
    parentId: (row.parent_id as string) ?? undefined,
    createdAt: row.created_at as string
  }
}
