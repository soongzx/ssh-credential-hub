/**
 * 连接状态管理 Store
 * 使用 Pinia 管理连接数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Connection } from '@shared/types'
import * as connectionApi from '../api/ipc'

export const useConnectionStore = defineStore('connection', () => {
  // State
  const connections = ref<Connection[]>([])
  const loading = ref(false)
  const searchKeyword = ref('')

  // Getters
  const filteredConnections = computed(() => {
    if (!searchKeyword.value.trim()) {
      return connections.value
    }
    const keyword = searchKeyword.value.toLowerCase()
    return connections.value.filter(
      (conn) =>
        conn.name.toLowerCase().includes(keyword) ||
        conn.host.toLowerCase().includes(keyword) ||
        conn.username.toLowerCase().includes(keyword) ||
        (conn.description?.toLowerCase().includes(keyword) ?? false)
    )
  })

  const connectionCount = computed(() => connections.value.length)

  // 筛选功能
  const filters = ref({
    search: '',
    tags: [] as string[],
    group: null as string | null,
    authType: null as string | null
  })

  function applyFilters(newFilters: {
    search: string
    tags: string[]
    group: string | null
    authType: string | null
  }): void {
    filters.value = newFilters
  }

  // Actions
  async function fetchConnections(): Promise<void> {
    loading.value = true
    try {
      connections.value = await connectionApi.getAllConnections()
    } finally {
      loading.value = false
    }
  }

  async function searchConnections(keyword: string): Promise<void> {
    searchKeyword.value = keyword
    if (!keyword.trim()) {
      await fetchConnections()
      return
    }
    loading.value = true
    try {
      connections.value = await connectionApi.searchConnections(keyword)
    } finally {
      loading.value = false
    }
  }

  async function addConnection(
    data: Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Connection> {
    const id = crypto.randomUUID()
    const connection = await connectionApi.createConnection({
      id,
      ...data
    })
    connections.value.unshift(connection)
    return connection
  }

  async function addConnections(
    data: Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<Connection[]> {
    const connectionsToCreate = data.map((item) => ({
      id: crypto.randomUUID(),
      ...item
    }))
    const createdConnections = await connectionApi.createConnections(connectionsToCreate)
    connections.value.unshift(...createdConnections)
    return createdConnections
  }

  async function updateConnection(
    id: string,
    data: Partial<Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Connection> {
    const updated = await connectionApi.updateConnection(id, data)
    const index = connections.value.findIndex((c) => c.id === id)
    if (index > -1) {
      connections.value[index] = updated
    }
    return updated
  }

  async function removeConnection(id: string): Promise<boolean> {
    const result = await connectionApi.deleteConnection(id)
    if (result) {
      connections.value = connections.value.filter((c) => c.id !== id)
    }
    return result
  }

  async function cloneConnection(id: string): Promise<Connection | null> {
    const cloned = await connectionApi.cloneConnection(id)
    if (cloned) {
      connections.value.unshift(cloned)
    }
    return cloned
  }

  function getConnectionById(id: string): Connection | undefined {
    return connections.value.find((c) => c.id === id)
  }

  return {
    connections,
    loading,
    searchKeyword,
    filteredConnections,
    connectionCount,
    fetchConnections,
    searchConnections,
    addConnection,
    updateConnection,
    removeConnection,
    getConnectionById
  }
})
