/**
 * 终端配置数据访问层
 * 封装 terminal_configs 表的 CRUD 操作
 */
import { getDatabase } from '../index'

export interface TerminalConfig {
  id: string
  name: string
  type: 'windows-terminal' | 'tabby' | 'xshell' | 'securecrt' | 'putty'
  commandTemplate: string
  isDefault: boolean
}

export interface CreateTerminalConfigInput {
  id: string
  name: string
  type: 'windows-terminal' | 'tabby' | 'xshell' | 'securecrt' | 'putty'
  commandTemplate: string
  isDefault?: boolean
}

export interface UpdateTerminalConfigInput {
  name?: string
  type?: 'windows-terminal' | 'tabby' | 'xshell' | 'securecrt' | 'putty'
  commandTemplate?: string
  isDefault?: boolean
}

/**
 * 创建终端配置
 */
export function createTerminalConfig(
  input: CreateTerminalConfigInput
): TerminalConfig {
  const db = getDatabase()

  // 如果设为默认，先取消其他默认配置
  if (input.isDefault) {
    db.prepare('UPDATE terminal_configs SET is_default = 0').run()
  }

  const stmt = db.prepare(
    'INSERT INTO terminal_configs (id, name, type, command_template, is_default) VALUES (?, ?, ?, ?, ?)'
  )
  stmt.run(
    input.id,
    input.name,
    input.type,
    input.commandTemplate,
    input.isDefault ? 1 : 0
  )

  return getTerminalConfigById(input.id)!
}

/**
 * 根据 ID 获取终端配置
 */
export function getTerminalConfigById(id: string): TerminalConfig | null {
  const db = getDatabase()

  const row = db
    .prepare('SELECT * FROM terminal_configs WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined

  if (!row) return null
  return mapRowToTerminalConfig(row)
}

/**
 * 获取所有终端配置
 */
export function getAllTerminalConfigs(): TerminalConfig[] {
  const db = getDatabase()

  const rows = db
    .prepare('SELECT * FROM terminal_configs ORDER BY name')
    .all() as Record<string, unknown>[]

  return rows.map(mapRowToTerminalConfig)
}

/**
 * 获取默认终端配置
 */
export function getDefaultTerminalConfig(): TerminalConfig | null {
  const db = getDatabase()

  const row = db
    .prepare('SELECT * FROM terminal_configs WHERE is_default = 1 LIMIT 1')
    .get() as Record<string, unknown> | undefined

  if (!row) return null
  return mapRowToTerminalConfig(row)
}

/**
 * 更新终端配置
 */
export function updateTerminalConfig(
  id: string,
  input: UpdateTerminalConfigInput
): TerminalConfig {
  const db = getDatabase()

  // 如果设为默认，先取消其他默认配置
  if (input.isDefault) {
    db.prepare('UPDATE terminal_configs SET is_default = 0').run()
  }

  const sets: string[] = []
  const values: unknown[] = []

  if (input.name !== undefined) {
    sets.push('name = ?')
    values.push(input.name)
  }
  if (input.type !== undefined) {
    sets.push('type = ?')
    values.push(input.type)
  }
  if (input.commandTemplate !== undefined) {
    sets.push('command_template = ?')
    values.push(input.commandTemplate)
  }
  if (input.isDefault !== undefined) {
    sets.push('is_default = ?')
    values.push(input.isDefault ? 1 : 0)
  }

  if (sets.length === 0) {
    return getTerminalConfigById(id)!
  }

  values.push(id)
  db.prepare(`UPDATE terminal_configs SET ${sets.join(', ')} WHERE id = ?`).run(
    ...values
  )

  return getTerminalConfigById(id)!
}

/**
 * 删除终端配置
 */
export function deleteTerminalConfig(id: string): boolean {
  const db = getDatabase()

  const result = db.prepare('DELETE FROM terminal_configs WHERE id = ?').run(id)
  return result.changes > 0
}

function mapRowToTerminalConfig(row: Record<string, unknown>): TerminalConfig {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as TerminalConfig['type'],
    commandTemplate: row.command_template as string,
    isDefault: row.is_default === 1
  }
}
