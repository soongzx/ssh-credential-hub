/**
 * Tag Repository 测试
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, cleanupTestDatabase, generateUUID } from './testUtils'
import Database from 'better-sqlite3'

describe('Tag Repository', () => {
  let db: Database.Database

  beforeEach(() => {
    db = createTestDatabase()
  })

  afterEach(() => {
    cleanupTestDatabase(db)
  })

  describe('createTag', () => {
    it('DB-Tag-001: 创建标签 - 正常', () => {
      const id = generateUUID()
      const name = 'Production'

      db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(id, name)

      const row = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as Record<string, unknown>

      expect(row).toBeDefined()
      expect(row.id).toBe(id)
      expect(row.name).toBe('Production')
    })

    it('DB-Tag-002: 创建标签 - 自定义颜色', () => {
      const id = generateUUID()
      const name = 'Development'
      const color = '#ff6600'

      db.prepare(`INSERT INTO tags (id, name, color) VALUES (?, ?, ?)`).run(id, name, color)

      const row = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as Record<string, unknown>

      expect(row).toBeDefined()
      expect(row.color).toBe('#ff6600')
    })

    it('创建重复名称标签应失败', () => {
      const id1 = generateUUID()
      const id2 = generateUUID()
      const name = 'Duplicate'

      db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(id1, name)

      expect(() => {
        db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(id2, name)
      }).toThrow()
    })
  })

  describe('getAllTags', () => {
    it('DB-Tag-003: 查询所有标签', () => {
      db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(generateUUID(), 'Tag1')
      db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(generateUUID(), 'Tag2')
      db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(generateUUID(), 'Tag3')

      const rows = db.prepare('SELECT * FROM tags ORDER BY created_at').all() as Record<string, unknown>[]

      expect(rows).toHaveLength(3)
    })
  })

  describe('updateTag', () => {
    it('DB-Tag-004: 更新标签 - 修改颜色', () => {
      const id = generateUUID()
      db.prepare(`INSERT INTO tags (id, name, color) VALUES (?, ?, ?)`).run(id, 'Test', '#000000')

      db.prepare(`UPDATE tags SET color = ? WHERE id = ?`).run('#ffffff', id)

      const row = db.prepare('SELECT color FROM tags WHERE id = ?').get(id) as Record<string, unknown>
      expect(row.color).toBe('#ffffff')
    })
  })

  describe('deleteTag', () => {
    it('DB-Tag-005: 删除标签 - 存在关联连接', () => {
      const tagId = generateUUID()
      const connId = generateUUID()

      // 创建标签
      db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId, 'ToDelete')
      // 创建连接
      db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(connId, 'Server', '10.0.0.1', 22, 'user', 'password')
      // 创建关联
      db.prepare(`INSERT INTO connection_tags (connection_id, tag_id) VALUES (?, ?)`).run(connId, tagId)

      // 删除标签（由于外键级联，关联会自动清理）
      db.prepare('DELETE FROM tags WHERE id = ?').run(tagId)

      const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(tagId)
      expect(tag).toBeUndefined()

      // 验证关联已清理
      const assoc = db.prepare('SELECT * FROM connection_tags WHERE tag_id = ?').get(tagId)
      expect(assoc).toBeUndefined()
    })

    it('DB-Tag-006: 删除标签 - 不存在', () => {
      const result = db.prepare('DELETE FROM tags WHERE id = ?').run('non-existent')
      expect(result.changes).toBe(0)
    })
  })
})
