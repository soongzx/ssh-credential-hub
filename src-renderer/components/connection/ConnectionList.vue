<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { NCard, NSpace, NTag, NButton, NEmpty, NSpin, NText, NIcon, NPopconfirm } from 'naive-ui'
import { CreateOutline, TrashOutline, DesktopOutline } from '@vicons/ionicons5'
import type { Connection, Tag } from '@shared/types'
import { useTagStore } from '../../stores/useTagStore'
import { useConnectionStore } from '../../stores/useConnectionStore'

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

// 缓存每个连接的标签
const connectionTagMap = ref<Record<string, Tag[]>>({})

onMounted(async () => {
  await tagStore.fetchTags()
  // 预加载所有连接的标签
  for (const conn of props.connections) {
    const tags = await tagStore.fetchTagsByConnection(conn.id)
    connectionTagMap.value[conn.id] = tags
  }
})

// 监听连接变化，更新标签
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

function getAuthTypeColor(authType: string): string {
  const map: Record<string, string> = {
    password: 'success',
    publickey: 'warning',
    agent: 'info'
  }
  return map[authType] ?? 'default'
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
    <NSpace v-if="props.connections.length > 0" vertical>
      <NCard
        v-for="conn in props.connections"
        :key="conn.id"
        size="small"
        hoverable
        class="connection-card"
      >
        <template #header>
          <NSpace align="center" justify="space-between">
            <NSpace align="center">
              <NIcon size="18" :component="DesktopOutline" />
              <NText strong>{{ conn.name }}</NText>
            </NSpace>
            <NSpace>
              <NButton
                text
                size="small"
                @click="emit('connect', conn.id)"
              >
                <template #icon>
                  <NIcon :component="DesktopOutline" />
                </template>
                连接
              </NButton>
              <NButton
                text
                size="small"
                @click="emit('edit', conn.id)"
              >
                <template #icon>
                  <NIcon :component="CreateOutline" />
                </template>
                编辑
              </NButton>
              <NPopconfirm @positive-click="handleDelete(conn.id)">
                <template #trigger>
                  <NButton
                    text
                    size="small"
                    type="error"
                  >
                    <template #icon>
                      <NIcon :component="TrashOutline" />
                    </template>
                    删除
                  </NButton>
                </template>
                确定删除此连接？
              </NPopconfirm>
            </NSpace>
          </NSpace>
        </template>

        <NSpace vertical size="small">
          <NSpace>
            <NText depth="3">主机:</NText>
            <NText>{{ conn.host }}:{{ conn.port }}</NText>
          </NSpace>

          <NSpace>
            <NText depth="3">用户:</NText>
            <NText>{{ conn.username }}</NText>
          </NSpace>

          <NSpace>
            <NText depth="3">认证:</NText>
            <NTag :type="getAuthTypeColor(conn.authType)" size="small">
              {{ getAuthTypeLabel(conn.authType) }}
            </NTag>
          </NSpace>

          <NSpace v-if="getConnectionTags(conn.id).length > 0">
            <NText depth="3">标签:</NText>
            <NTag
              v-for="tag in getConnectionTags(conn.id)"
              :key="tag.id"
              :color="{ color: tag.color, textColor: '#fff' }"
              size="small"
            >
              {{ tag.name }}
            </NTag>
          </NSpace>

          <NSpace v-if="conn.description">
            <NText depth="3">备注:</NText>
            <NText>{{ conn.description }}</NText>
          </NSpace>
        </NSpace>
      </NCard>
    </NSpace>

    <NEmpty v-else description="暂无连接记录" />
  </NSpin>
</template>

<style scoped>
.connection-card {
  margin-bottom: 8px;
}

.connection-card:last-child {
  margin-bottom: 0;
}
</style>
