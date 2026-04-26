/**
 * 数据库连接管理
 * 使用 better-sqlite3 提供同步 SQLite 操作
 */
import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

let db: Database.Database | null = null

/**
 * 获取数据库文件路径
 * 生产环境：用户数据目录
 * 开发环境：项目根目录
 */
function getDbPath(): string {
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    return path.join(process.cwd(), 'data', 'app.db')
  }
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'app.db')
}

/**
 * 初始化数据库连接
 * 自动创建数据目录，启用 WAL 模式
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db
  }

  const dbPath = getDbPath()
  const dbDir = path.dirname(dbPath)

  // 确保数据目录存在
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  db = new Database(dbPath)

  // 启用 WAL 模式，提升并发性能
  db.pragma('journal_mode = WAL')

  // 启用外键约束
  db.pragma('foreign_keys = ON')

  return db
}

/**
 * 获取数据库实例
 * @throws 如果数据库未初始化
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
