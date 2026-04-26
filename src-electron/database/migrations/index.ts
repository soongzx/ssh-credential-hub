/**
 * 数据库迁移系统
 * 版本控制表结构变更
 */
import { getDatabase } from '../index'

interface Migration {
  version: number
  name: string
  sql: string
}

/**
 * 迁移历史记录
 * 按版本号顺序排列
 */
const migrations: Migration[] = [
  {
    version: 1,
    name: 'init_schema',
    sql: `
      -- 连接记录表
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 22,
        username TEXT NOT NULL,
        auth_type TEXT NOT NULL CHECK(auth_type IN ('password', 'publickey', 'agent')),
        password_encrypted TEXT,
        private_key_path TEXT,
        passphrase_encrypted TEXT,
        group_id TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
      );

      -- 标签表
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL DEFAULT '#1890ff',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- 连接-标签关联表
      CREATE TABLE IF NOT EXISTS connection_tags (
        connection_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (connection_id, tag_id),
        FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

      -- 分组表
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES groups(id) ON DELETE CASCADE
      );

      -- 终端配置表
      CREATE TABLE IF NOT EXISTS terminal_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('windows-terminal', 'tabby', 'xshell', 'securecrt', 'putty')),
        command_template TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_connections_group ON connections(group_id);
      CREATE INDEX IF NOT EXISTS idx_connections_name ON connections(name);
      CREATE INDEX IF NOT EXISTS idx_connections_host ON connections(host);
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
      CREATE INDEX IF NOT EXISTS idx_groups_parent ON groups(parent_id);
      CREATE INDEX IF NOT EXISTS idx_connection_tags_tag ON connection_tags(tag_id);
    `
  }
]

/**
 * 获取当前数据库版本
 */
function getCurrentVersion(): number {
  const db = getDatabase()

  // 检查迁移表是否存在
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
    )
    .get()

  if (!tableExists) {
    return 0
  }

  const row = db
    .prepare('SELECT MAX(version) as version FROM schema_migrations')
    .get() as { version: number } | undefined

  return row?.version ?? 0
}

/**
 * 执行迁移
 * 自动创建迁移表，按顺序执行未应用的迁移
 */
export function runMigrations(): void {
  const db = getDatabase()

  // 创建迁移记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const currentVersion = getCurrentVersion()

  // 筛选需要执行的迁移
  const pendingMigrations = migrations.filter((m) => m.version > currentVersion)

  if (pendingMigrations.length === 0) {
    return
  }

  // 按事务执行迁移
  const applyMigration = db.transaction((migration: Migration) => {
    db.exec(migration.sql)
    db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(
      migration.version,
      migration.name
    )
  })

  for (const migration of pendingMigrations) {
    applyMigration(migration)
  }
}
