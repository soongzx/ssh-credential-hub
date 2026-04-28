<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { NCard, NSpace, NTag, NButton, NEmpty, NSpin, NText, NIcon, NPopconfirm, NBadge } from 'naive-ui'
import { CreateOutline, TrashOutline, DesktopOutline, AddOutline } from '@vicons/ionicons5'
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

function getConnectionTags(connectionId: string): Tag[] {
  return connectionTagMap.value[connectionId] ?? []
}

async function handleDelete(id: string): Promise<void> {
  await connectionStore.removeConnection(id)
}
</script>

<template>
  <NSpin :show="props.loading">
    <!-- 空状态 -->
    <div v-if="props.connections.length === 0" class="empty-state">
      <NEmpty description="暂无连接记录">
        <template #extra>
          <NText depth="3" style="font-size: 13px">
            从左侧菜单选择「添加连接」开始使用
          </NText>
        </template>
      </NEmpty>
    </div>

    <!-- 连接列表 -->
    <div v-else class="connection-list">
      <NCard
        v-for="conn in props.connections"
        :key="conn.id"
        size="small"
        class="connection-card"
        :body-style="{ padding: '16px' }"
      >
        <!-- 卡片头部 -->
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <NIcon size="18" :component="DesktopOutline" style="color: #f54e00" />
              <NText strong style="font-size: 15px; color: #26251e; margin-left: 10px">
                {{ conn.name }}
              </NText>
            </div>
            <NSpace>
              <NButton
                text
                size="small"
                style="color: #f54e00; font-size: 13px"
                @click="emit('connect', conn.id)"
              >
                连接
              </NButton>
              <NButton
                text
                size="small"
                style="color: rgba(38, 37, 30, 0.55); font-size: 13px"
                @click="emit('edit', conn.id)"
              >
                编辑
              </NButton>
              <NPopconfirm @positive-click="handleDelete(conn.id)">
                <template #trigger>
                  <NButton
                    text
                    size="small"
                    style="color: #cf2d56; font-size: 13px"
                  >
                    删除
                  </NButton>
                </template>
                确定删除此连接？
              </NPopconfirm>
            </NSpace>
          </div>
        </template>

        <!-- 卡片内容 -->
        <div class="card-content">
          <div class="info-row">
            <span class="label">主机</span>
            <NText code style="font-size: 13px">{{ conn.host }}:{{ conn.port }}</NText>
          </div>
          <div class="info-row">
            <span class="label">用户</span>
            <NText style="font-size: 13px; color: #26251e">{{ conn.username }}</NText>
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

.connection-card {
  background: #f2f1ed;
  border: 1px solid rgba(38, 37, 30, 0.1);
  border-radius: 8px;
  transition: box-shadow 200ms ease, border-color 200ms ease;
}

.connection-card:hover {
  border-color: rgba(38, 37, 30, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
  color: rgba(38, 37, 30, 0.55);
  font-size: 13px;
  min-width: 40px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #f2f1ed;
  border: 1px solid rgba(38, 37, 30, 0.1);
  border-radius: 8px;
}
</style>
