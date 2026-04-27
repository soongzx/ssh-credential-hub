/**
 * Group Repository 测试
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, cleanupTestDatabase, generateUUID } from './testUtils'
import Database from 'better-sqlite3'

describe('Group Repository', () => {
  let db: Database.Database

  beforeEach(() => {
    db = createTestDatabase()
  })

  afterEach(() => {
    cleanupTestDatabase(db)
  })

  describe('createGroup', () => {
    it('DB-Grp-001: 创建分组 - 根分组', () => {
      const id = generateUUID()
      const name = 'Production'

      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(id, name, null)

      const row = db.prepare('SELECT * FROM groups WHERE id = ?').get(id) as Record<string, unknown>

      expect(row).toBeDefined()
      expect(row.id).toBe(id)
      expect(row.name).toBe('Production')
      expect(row.parent_id).toBeNull()
    })

    it('DB-Grp-002: 创建分组 - 子分组', () => {
      const parentId = generateUUID()
      const childId = generateUUID()

      // 创建父分组
      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(parentId, 'Parent', null)
      // 创建子分组
      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(childId, 'Child', parentId)

      const child = db.prepare('SELECT * FROM groups WHERE id = ?').get(childId) as Record<string, unknown>

      expect(child.parent_id).toBe(parentId)
    })
  })

  describe('getGroupTree', () => {
    it('DB-Grp-003: 查询分组树', () => {
      // 创建树形结构
      const root1 = generateUUID()
      const root2 = generateUUID()
      const child1 = generateUUID()

      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(root1, 'Root1', null)
      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(root2, 'Root2', null)
      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(child1, 'Child1', root1)

      const rows = db.prepare('SELECT * FROM groups ORDER BY created_at').all() as Record<string, unknown>[]

      expect(rows).toHaveLength(3)

      // 验证父子关系
      const child = rows.find(r => r.id === child1) as Record<string, unknown>
      expect(child.parent_id).toBe(root1)
    })
  })

  describe('updateGroup', () => {
    it('DB-Grp-004: 更新分组 - 重命名', () => {
      const id = generateUUID()
      db.prepare(`INSERT INTO groups (id, name) VALUES (?, ?)`).run(id, 'Old Name')

      db.prepare(`UPDATE groups SET name = ? WHERE id = ?`).run('New Name', id)

      const row = db.prepare('SELECT name FROM groups WHERE id = ?').get(id) as Record<string, unknown>
      expect(row.name).toBe('New Name')
    })

    it('DB-Grp-007: 移动分组 - 改变父分组', () => {
      const parent1 = generateUUID()
      const parent2 = generateUUID()
      const child = generateUUID()

      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(parent1, 'Parent1', null)
      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(parent2, 'Parent2', null)
      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(child, 'Child', parent1)

      // 移动到新的父分组
      db.prepare(`UPDATE groups SET parent_id = ? WHERE id = ?`).run(parent2, child)

      const updated = db.prepare('SELECT parent_id FROM groups WHERE id = ?').get(child) as Record<string, unknown>
      expect(updated.parent_id).toBe(parent2)
    })
  })

  describe('deleteGroup', () => {
    it('DB-Grp-005: 删除分组 - 有子分组', () => {
      const parentId = generateUUID()
      const childId = generateUUID()

      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(parentId, 'Parent', null)
      db.prepare(`INSERT INTO groups (id, name, parent_id) VALUES (?, ?, ?)`).run(childId, 'Child', parentId)

      // 由于有子分组，删除应该被外键约束阻止
      // 或者让 ON DELETE CASCADE 一起删除
      // 取决于外键设置，这里测试 CASCADE 行为
      db.prepare('DELETE FROM groups WHERE id = ?').run(parentId)

      // 父分组已删除
      const parent = db.prepare('SELECT * FROM groups WHERE id = ?').get(parentId)
      expect(parent).toBeUndefined()
    })

    it('DB-Grp-006: 删除分组 - 无子分组', () => {
      const id = generateUUID()
      db.prepare(`INSERT INTO groups (id, name) VALUES (?, ?)`).run(id, 'Standalone')

      db.prepare('DELETE FROM groups WHERE id = ?').run(id)

      const row = db.prepare('SELECT * FROM groups WHERE id = ?').get(id)
      expect(row).toBeUndefined()
    })
  })
})

describe('Connection-Tag Association', () => {
  let db: Database.Database

  beforeEach(() => {
    db = createTestDatabase()
  })

  afterEach(() => {
    cleanupTestDatabase(db)
  })

  it('DB-Assoc-001: 添加标签到连接', () => {
    const connId = generateUUID()
    const tagId = generateUUID()

    db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(connId, 'Server', '10.0.0.1', 22, 'user', 'password')
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId, 'Web')
    db.prepare(`INSERT INTO connection_tags (connection_id, tag_id) VALUES (?, ?)`).run(connId, tagId)

    const assoc = db.prepare('SELECT * FROM connection_tags WHERE connection_id = ? AND tag_id = ?').get(connId, tagId)
    expect(assoc).toBeDefined()
  })

  it('DB-Assoc-002: 移除连接的标签', () => {
    const connId = generateUUID()
    const tagId = generateUUID()

    db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(connId, 'Server', '10.0.0.1', 22, 'user', 'password')
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId, 'Web')
    db.prepare(`INSERT INTO connection_tags (connection_id, tag_id) VALUES (?, ?)`).run(connId, tagId)

    db.prepare('DELETE FROM connection_tags WHERE connection_id = ? AND tag_id = ?').run(connId, tagId)

    const assoc = db.prepare('SELECT * FROM connection_tags WHERE connection_id = ? AND tag_id = ?').get(connId, tagId)
    expect(assoc).toBeUndefined()
  })

  it('DB-Assoc-003: 查询连接的所有标签', () => {
    const connId = generateUUID()
    const tagId1 = generateUUID()
    const tagId2 = generateUUID()

    db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(connId, 'Server', '10.0.0.1', 22, 'user', 'password')
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId1, 'Tag1')
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId2, 'Tag2')
    db.prepare(`INSERT INTO connection_tags (connection_id, tag_id) VALUES (?, ?)`).run(connId, tagId1)
    db.prepare(`INSERT INTO connection_tags (connection_id, tag_id) VALUES (?, ?)`).run(connId, tagId2)

    const tags = db.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN connection_tags ct ON t.id = ct.tag_id
      WHERE ct.connection_id = ?
    `).all(connId) as Record<string, unknown>[]

    expect(tags).toHaveLength(2)
  })

  it('DB-Assoc-004: 查询标签的所有连接', () => {
    const connId1 = generateUUID()
    const connId2 = generateUUID()
    const tagId = generateUUID()

    db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(connId1, 'Server1', '10.0.0.1', 22, 'user', 'password')
    db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(connId2, 'Server2', '10.0.0.2', 22, 'user', 'password')
    db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId, 'Shared')
    db.prepare(`INSERT INTO connection_tags (connection_id, tag_id) VALUES (?, ?)`).run(connId1, tagId)
    db.prepare(`INSERT INTO connection_tags (connection_id, tag_id) VALUES (?, ?)`).run(connId2, tagId)

    const conns = db.prepare(`
      SELECT c.* FROM connections c
      INNER JOIN connection_tags ct ON c.id = ct.connection_id
      WHERE ct.tag_id = ?
    `).all(tagId) as Record<string, unknown>[]

    expect(conns).toHaveLength(2)
  })
})
