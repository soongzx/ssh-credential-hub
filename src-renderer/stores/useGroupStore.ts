/**
 * 分组状态管理 Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Group } from '@shared/types'
import * as groupApi from '../api/ipc'

export const useGroupStore = defineStore('group', () => {
  // State
  const groups = ref<Group[]>([])
  const loading = ref(false)

  // Getters
  const rootGroups = computed(() =>
    groups.value.filter((g) => !g.parentId)
  )

  function getChildren(parentId: string): Group[] {
    return groups.value.filter((g) => g.parentId === parentId)
  }

  // Actions
  async function fetchGroups(): Promise<void> {
    loading.value = true
    try {
      groups.value = await groupApi.getAllGroups()
    } finally {
      loading.value = false
    }
  }

  async function addGroup(data: {
    name: string
    parentId?: string
  }): Promise<Group> {
    const id = crypto.randomUUID()
    const group = await groupApi.createGroup({
      id,
      ...data
    })
    // 重新获取所有分组以确保数据同步
    await fetchGroups()
    return group
  }

  async function updateGroup(
    id: string,
    data: Partial<Pick<Group, 'name' | 'parentId'>>
  ): Promise<Group> {
    const updated = await groupApi.updateGroup(id, data)
    // 重新获取所有分组以确保数据同步
    await fetchGroups()
    return updated
  }

  async function removeGroup(id: string): Promise<boolean> {
    const result = await groupApi.deleteGroup(id)
    if (result) {
      // 重新获取所有分组以确保数据同步
      await fetchGroups()
    }
    return result
  }

  async function fetchGroupTree(): Promise<void> {
    loading.value = true
    try {
      // 为了简化，我们直接使用所有分组，实际应用中可能需要更复杂的树结构处理
      groups.value = await groupApi.getAllGroups()
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    loading,
    rootGroups,
    getChildren,
    fetchGroups,
    fetchGroupTree,
    addGroup,
    updateGroup,
    removeGroup
  }
})
