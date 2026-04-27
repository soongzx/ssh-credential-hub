/**
 * Connection Repository 测试
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, cleanupTestDatabase, generateUUID } from './testUtils'
import Database from 'better-sqlite3'

// Mock cryptoService - 在测试环境中使用固定密钥
vi.mock('../src-electron/services/cryptoService', () => ({
  encrypt: (text: string) => `encrypted_${text}`,
  decrypt: (text: string) => text.replace('encrypted_', '')
}))

// 重新导入被 mock 的模块
import { encrypt, decrypt } from '../src-electron/services/cryptoService'

describe('Connection Repository', () => {
  let db: Database.Database

  beforeEach(() => {
    db = createTestDatabase()
  })

  afterEach(() => {
    cleanupTestDatabase(db)
  })

  describe('createConnection', () => {
    it('DB-Conn-001: 新增连接 - 必填字段', () => {
      const id = generateUUID()
      const input = {
        id,
        name: 'Test Server',
        host: '192.168.1.100',
        username: 'admin',
        authType: 'password' as const,
        port: 22
      }

      // 模拟插入
      const stmt = db.prepare(`
        INSERT INTO connections (id, name, host, port, username, auth_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      stmt.run(input.id, input.name, input.host, input.port, input.username, input.authType)

      const row = db.prepare('SELECT * FROM connections WHERE id = ?').get(id) as Record<string, unknown>

      expect(row).toBeDefined()
      expect(row.id).toBe(id)
      expect(row.name).toBe('Test Server')
      expect(row.host).toBe('192.168.1.100')
      expect(row.username).toBe('admin')
      expect(row.auth_type).toBe('password')
    })

    it('DB-Conn-002: 新增连接 - 验证必填字段', () => {
      const id = generateUUID()
      const input = {
        id,
        name: 'Test Server',
        host: '192.168.1.100',
        // 缺少 username 应该失败
        authType: 'password' as const
      }

      // 由于 username 是必填，插入时应该抛出错误
      const stmt = db.prepare(`
        INSERT INTO connections (id, name, host, username, auth_type)
        VALUES (?, ?, ?, ?, ?)
      `)

      expect(() => {
        stmt.run(input.id, input.name, input.host, null, input.authType)
      }).toThrow()
    })
  })

  describe('getConnectionById', () => {
    it('DB-Conn-003: 查询单个连接', () => {
      const id = generateUUID()
      db.prepare(`
        INSERT INTO connections (id, name, host, port, username, auth_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, 'Test', '10.0.0.1', 22, 'user', 'password')

      const row = db.prepare('SELECT * FROM connections WHERE id = ?').get(id) as Record<string, unknown> | undefined

      expect(row).toBeDefined()
      expect(row!.id).toBe(id)
      expect(row!.name).toBe('Test')
      expect(row!.host).toBe('10.0.0.1')
    })

    it('查询不存在的连接应返回 undefined', () => {
      const row = db.prepare('SELECT * FROM connections WHERE id = ?').get('non-existent') as Record<string, unknown> | undefined
      expect(row).toBeUndefined()
    })
  })

  describe('getAllConnections', () => {
    it('DB-Conn-004: 查询所有连接', () => {
      // 插入多条记录
      const id1 = generateUUID()
      const id2 = generateUUID()
      db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id1, 'Server1', '10.0.0.1', 22, 'user1', 'password')

      db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id2, 'Server2', '10.0.0.2', 22, 'user2', 'publickey')

      const rows = db.prepare('SELECT * FROM connections ORDER BY created_at DESC').all() as Record<string, unknown>[]

      expect(rows).toHaveLength(2)
      // 验证至少有两条记录
      const names = rows.map(r => r.name as string)
      expect(names).toContain('Server1')
      expect(names).toContain('Server2')
    })
  })

  describe('updateConnection', () => {
    it('DB-Conn-005: 更新连接 - 正常修改', () => {
      const id = generateUUID()
      db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id, 'Old Name', '10.0.0.1', 22, 'user', 'password')

      db.prepare(`UPDATE connections SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .run('New Name', id)

      const row = db.prepare('SELECT name FROM connections WHERE id = ?').get(id) as Record<string, unknown>
      expect(row.name).toBe('New Name')
    })

    it('DB-Conn-006: 更新连接 - 修改分组', () => {
      const groupId = generateUUID()
      const connId = generateUUID()

      // 创建分组
      db.prepare(`INSERT INTO groups (id, name) VALUES (?, ?)`).run(groupId, 'Test Group')

      // 创建连接
      db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(connId, 'Server', '10.0.0.1', 22, 'user', 'password')

      // 更新连接的分组
      db.prepare(`UPDATE connections SET group_id = ? WHERE id = ?`).run(groupId, connId)

      const row = db.prepare('SELECT group_id FROM connections WHERE id = ?').get(connId) as Record<string, unknown>
      expect(row.group_id).toBe(groupId)
    })
  })

  describe('deleteConnection', () => {
    it('DB-Conn-007: 删除连接 - 存在关联标签', () => {
      const connId = generateUUID()
      const tagId = generateUUID()

      // 创建连接和标签
      db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(connId, 'Server', '10.0.0.1', 22, 'user', 'password')
      db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(tagId, 'Production')
      db.prepare(`INSERT INTO connection_tags (connection_id, tag_id) VALUES (?, ?)`).run(connId, tagId)

      // 删除连接
      db.prepare('DELETE FROM connections WHERE id = ?').run(connId)

      // 验证连接已删除
      const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(connId)
      expect(conn).toBeUndefined()

      // 验证关联标签已清理
      const assoc = db.prepare('SELECT * FROM connection_tags WHERE connection_id = ?').get(connId)
      expect(assoc).toBeUndefined()
    })

    it('DB-Conn-008: 删除连接 - 不存在', () => {
      const result = db.prepare('DELETE FROM connections WHERE id = ?').run('non-existent')
      expect(result.changes).toBe(0)
    })
  })

  describe('searchConnections', () => {
    it('按名称模糊搜索', () => {
      db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(generateUUID(), 'Production Server', '10.0.0.1', 22, 'user', 'password')
      db.prepare(`INSERT INTO connections (id, name, host, port, username, auth_type) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(generateUUID(), 'Test Server', '10.0.0.2', 22, 'user', 'password')

      const rows = db.prepare(`
        SELECT * FROM connections WHERE name LIKE ?
      `).all('%Production%') as Record<string, unknown>[]

      expect(rows).toHaveLength(1)
      expect(rows[0].name).toBe('Production Server')
    })
  })
})
