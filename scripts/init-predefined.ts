/**
 * 初始化脚本 - 创建预设的分组和标签
 * 运行此脚本可自动创建项目分组和环境标签
 */
import { createGroup } from '../src-electron/database/repositories/groupRepository'
import { createTag as createTagRepo } from '../src-electron/database/repositories/tagRepository'
import { initDatabase } from '../src-electron/database/index'
import { generateUUID } from '../tests/testUtils'

// 创建预设的分组
async function createPredefinedGroups(): Promise<void> {
  // 初始化数据库
  initDatabase()
  
  // 创建项目分组
  const project1Id = generateUUID()
  const project2Id = generateUUID()
  const project3Id = generateUUID()
  
  console.log('Creating project groups...')
  
  createGroup({
    id: project1Id,
    name: '项目1'
  })
  
  createGroup({
    id: project2Id,
    name: '项目2'
  })
  
  createGroup({
    id: project3Id,
    name: '项目3'
  })
  
  console.log('Project groups created successfully')
}

// 创建预设的标签
async function createPredefinedTags(): Promise<void> {
  console.log('Creating environment tags...')
  
  // 创建环境标签
  const devTagId = generateUUID()
  const testTagId = generateUUID()
  const prodTagId = generateUUID()
  
  createTagRepo({
    id: devTagId,
    name: '开发环境',
    color: '#52c41a' // 绿色
  })
  
  createTagRepo({
    id: testTagId,
    name: '测试环境',
    color: '#1890ff' // 蓝色
  })
  
  createTagRepo({
    id: prodTagId,
    name: '生产环境',
    color: '#f5222d' // 红色
  })
  
  console.log('Environment tags created successfully')
}

// 主函数
async function main(): Promise<void> {
  try {
    console.log('Starting initialization...')
    
    await createPredefinedGroups()
    await createPredefinedTags()
    
    console.log('Initialization completed successfully!')
  } catch (error) {
    console.error('Initialization failed:', error)
    process.exit(1)
  }
}

// 执行主函数
main()