<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { NCard, NSpace, NTag, NButton, NEmpty, NSpin, NText, NIcon, NPopconfirm, NBadge } from 'naive-ui'
import { CreateOutline, TrashOutline, DesktopOutline, AddOutline } from '@vicons/ionicons5'
import type { Connection, Tag } from '@shared/types'
import { useTagStore } from '../../stores/useTagStore'
import { useConnectionStore } from '../../stores/useConnectionStore'
import { useThemeStore } from '../../stores/useThemeStore'

interface Props {
  connections: Connection[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'connect', id: string): void
}>()

const tagStore = useTagStore()
const connectionStore = useConnectionStore()
const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

const connectionTagMap = ref<Record<string, Tag[]>>({})

onMounted(async () => {
  await tagStore.fetchTags()
  for (const conn of props.connections) {
    const tags = await tagStore.fetchTagsByConnection(conn.id)
    connectionTagMap.value[conn.id] = tags
  }
})

watch(
  () => props.connections,
  async (newConnections) => {
    for (const conn of newConnections) {
      if (!connectionTagMap.value[conn.id]) {
        const tags = await tagStore.fetchTagsByConnection(conn.id)
        connectionTagMap.value[conn.id] = tags
      }
    }
  },
  { deep: true }
)

function getAuthTypeLabel(authType: string): string {
  const map: Record<string, string> = {
    password: '密码',
    publickey: '密钥',
    agent: 'Agent'
  }
  return map[authType] ?? authType
}

function getConnectionTags(connectionId: string): Tag[] {
  return connectionTagMap.value[connectionId] ?? []
}

async function handleDelete(id: string): Promise<void> {
  await connectionStore.removeConnection(id)
}
</script>

<template>
  <NSpin :show="props.loading">
    <div v-if="props.connections.length === 0" class="empty-state" :class="{ 'empty-state--dark': isDark, 'empty-state--light': !isDark }">
      <NEmpty description="暂无连接记录">
        <template #extra>
          <NText depth="3" style="font-size: 13px">
            从左侧菜单选择「添加连接」开始使用
          </NText>
        </template>
      </NEmpty>
    </div>

    <div v-else class="connection-list">
      <NCard
        v-for="conn in props.connections"
        :key="conn.id"
        size="small"
        class="connection-card"
        :class="{ 'connection-card--dark': isDark, 'connection-card--light': !isDark }"
        :body-style="{ padding: '16px' }"
      >
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <NIcon size="18" :component="DesktopOutline" class="card-icon" />
              <NText strong class="card-name">{{ conn.name }}</NText>
            </div>
            <NSpace>
              <NButton
                text
                size="small"
                class="btn-connect"
                @click="emit('connect', conn.id)"
              >
                连接
              </NButton>
              <NButton
                text
                size="small"
                class="btn-secondary"
                @click="emit('edit', conn.id)"
              >
                编辑
              </NButton>
              <NPopconfirm @positive-click="handleDelete(conn.id)">
                <template #trigger>
                  <NButton
                    text
                    size="small"
                    class="btn-danger"
                  >
                    删除
                  </NButton>
                </template>
                确定删除此连接？
              </NPopconfirm>
            </NSpace>
          </div>
        </template>

        <div class="card-content">
          <div class="info-row">
            <span class="label">主机</span>
            <NText code style="font-size: 13px">{{ conn.host }}:{{ conn.port }}</NText>
          </div>
          <div class="info-row">
            <span class="label">用户</span>
            <NText class="info-value">{{ conn.username }}</NText>
          </div>
          <div class="info-row">
            <span class="label">认证</span>
            <NTag
              :type="conn.authType === 'password' ? 'success' : conn.authType === 'publickey' ? 'warning' : 'info'"
              size="small"
              style="border-radius: 9999px; font-size: 12px"
            >
              {{ getAuthTypeLabel(conn.authType) }}
            </NTag>
          </div>
          <div v-if="getConnectionTags(conn.id).length > 0" class="info-row">
            <span class="label">标签</span>
            <NSpace>
              <NTag
                v-for="tag in getConnectionTags(conn.id)"
                :key="tag.id"
                size="small"
                style="border-radius: 9999px; font-size: 12px"
              >
                {{ tag.name }}
              </NTag>
            </NSpace>
          </div>
          <div v-if="conn.description" class="info-row">
            <span class="label">备注</span>
            <NText depth="3" style="font-size: 13px">{{ conn.description }}</NText>
          </div>
        </div>
      </NCard>
    </div>
  </NSpin>
</template>

<style scoped>
.connection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.connection-card--dark {
  border: 1px solid #2A2A2E;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.connection-card--dark:hover {
  border-color: #3A3A42;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.connection-card--light {
  border: 1px solid #E8DFD2;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.connection-card--light:hover {
  border-color: #D4C8B8;
  box-shadow: 0 4px 16px rgba(58, 50, 40, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
}

.card-icon {
  color: var(--text-brand, #5BA4F5);
}

.card-name {
  font-size: 15px !important;
  margin-left: 10px;
}

.btn-connect {
  font-size: 13px;
}

.btn-secondary {
  font-size: 13px;
  opacity: 0.7;
}

.btn-danger {
  font-size: 13px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  font-size: 13px;
  min-width: 40px;
  opacity: 0.5;
}

.info-value {
  font-size: 13px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border-radius: 10px;
}

.empty-state--dark {
  background: #0E0E10;
  border: 1px solid #1E1E22;
}

.empty-state--light {
  background: #FFFCF7;
  border: 1px solid #EDE6DA;
}
</style>
