<template>
  <NCard size="small" class="filter-card" :class="{ 'filter-card--dark': isDark, 'filter-card--light': !isDark }">
    <div class="filter-header">
      <div class="filter-title">
        <NIcon size="18" :component="FilterOutline" />
        <span>筛选</span>
      </div>
      <NButton
        text
        size="small"
        @click="resetFilters"
      >
        <NIcon :component="CloseOutline" />
        重置
      </NButton>
    </div>

    <div class="filter-content">
      <NSpace vertical size="small" class="filter-group">
        <div class="filter-group-title">搜索</div>
        <NInput
          v-model:value="searchKeyword"
          placeholder="搜索连接名称、主机、用户名、备注..."
          :prefix="() => h(NIcon, { component: SearchOutline })"
        />
      </NSpace>

      <NSpace vertical size="small" class="filter-group">
        <div class="filter-group-title">标签</div>
        <NSelect
          v-model:value="selectedTags"
          :options="tagOptions"
          multiple
          placeholder="选择标签"
          clearable
        />
      </NSpace>

      <NSpace vertical size="small" class="filter-group">
        <div class="filter-group-title">分组</div>
        <NSelect
          v-model:value="selectedGroup"
          :options="groupOptions"
          placeholder="选择分组"
          clearable
        />
      </NSpace>

      <NSpace vertical size="small" class="filter-group">
        <div class="filter-group-title">认证类型</div>
        <NSelect
          v-model:value="selectedAuthType"
          :options="authTypeOptions"
          placeholder="选择认证类型"
          clearable
        />
      </NSpace>
    </div>
  </NCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { NCard, NSpace, NButton, NSelect, NInput, NCheckbox, NIcon } from 'naive-ui'
import { SearchOutline, FilterOutline, CloseOutline } from '@vicons/ionicons5'
import type { Connection, Tag, Group } from '@shared/types'
import { useTagStore } from '../../stores/useTagStore'
import { useGroupStore } from '../../stores/useGroupStore'
import { useConnectionStore } from '../../stores/useConnectionStore'
import { useThemeStore } from '../../stores/useThemeStore'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

const tagStore = useTagStore()
const groupStore = useGroupStore()
const connectionStore = useConnectionStore()

// 筛选状态
const searchKeyword = ref('')
const selectedTags = ref<string[]>([])
const selectedGroup = ref<string | null>(null)
const selectedAuthType = ref<string | null>(null)

// 筛选选项
const tagOptions = computed(() => {
  return tagStore.tags.map(tag => ({
    label: tag.name,
    value: tag.id
  }))
})

const groupOptions = computed(() => {
  return groupStore.rootGroups.map(group => ({
    label: group.name,
    value: group.id
  }))
})

const authTypeOptions = [
  { label: '密码认证', value: 'password' },
  { label: '密钥认证', value: 'publickey' },
  { label: 'Agent认证', value: 'agent' }
]

// 合并筛选条件
const filters = computed(() => ({
  search: searchKeyword.value,
  tags: selectedTags.value,
  group: selectedGroup.value,
  authType: selectedAuthType.value
}))

// 当筛选条件变化时，触发筛选
watch(filters, (newFilters) => {
  // 在这里触发筛选逻辑
  connectionStore.applyFilters(newFilters)
}, { deep: true })

// 重置筛选
function resetFilters(): void {
  searchKeyword.value = ''
  selectedTags.value = []
  selectedGroup.value = null
  selectedAuthType.value = null
}
</script>

<style scoped>
.filter-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.filter-card--dark {
  border: 1px solid #2A2A2E;
}

.filter-card--light {
  border: 1px solid #E8DFD2;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 14px;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  width: 100%;
}

.filter-group-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-color);
}
</style>