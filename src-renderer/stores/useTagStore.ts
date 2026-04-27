/**
 * 标签状态管理 Store
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag } from '@shared/types'
import * as tagApi from '../api/ipc'

export const useTagStore = defineStore('tag', () => {
  // State
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  // Actions
  async function fetchTags(): Promise<void> {
    loading.value = true
    try {
      tags.value = await tagApi.getAllTags()
    } finally {
      loading.value = false
    }
  }

  async function addTag(data: { name: string; color?: string }): Promise<Tag> {
    const id = crypto.randomUUID()
    const tag = await tagApi.createTag({
      id,
      ...data
    })
    tags.value.push(tag)
    return tag
  }

  async function updateTag(
    id: string,
    data: Partial<Pick<Tag, 'name' | 'color'>>
  ): Promise<Tag> {
    const updated = await tagApi.updateTag(id, data)
    const index = tags.value.findIndex((t) => t.id === id)
    if (index > -1) {
      tags.value[index] = updated
    }
    return updated
  }

  async function removeTag(id: string): Promise<boolean> {
    const result = await tagApi.deleteTag(id)
    if (result) {
      tags.value = tags.value.filter((t) => t.id !== id)
    }
    return result
  }

  async function assignTagToConnection(
    connectionId: string,
    tagId: string
  ): Promise<void> {
    await tagApi.addTagToConnection(connectionId, tagId)
  }

  async function unassignTagFromConnection(
    connectionId: string,
    tagId: string
  ): Promise<void> {
    await tagApi.removeTagFromConnection(connectionId, tagId)
  }

  async function fetchTagsByConnection(connectionId: string): Promise<Tag[]> {
    return tagApi.getTagsByConnectionId(connectionId)
  }

  return {
    tags,
    loading,
    fetchTags,
    addTag,
    updateTag,
    removeTag,
    assignTagToConnection,
    unassignTagFromConnection,
    fetchTagsByConnection
  }
})
