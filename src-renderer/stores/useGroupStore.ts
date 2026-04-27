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
    groups.value.push(group)
    return group
  }

  async function updateGroup(
    id: string,
    data: Partial<Pick<Group, 'name' | 'parentId'>>
  ): Promise<Group> {
    const updated = await groupApi.updateGroup(id, data)
    const index = groups.value.findIndex((g) => g.id === id)
    if (index > -1) {
      groups.value[index] = updated
    }
    return updated
  }

  async function removeGroup(id: string): Promise<boolean> {
    const result = await groupApi.deleteGroup(id)
    if (result) {
      groups.value = groups.value.filter((g) => g.id !== id)
      // 同时移除子分组
      groups.value = groups.value.filter((g) => g.parentId !== id)
    }
    return result
  }

  return {
    groups,
    loading,
    rootGroups,
    getChildren,
    fetchGroups,
    addGroup,
    updateGroup,
    removeGroup
  }
})
