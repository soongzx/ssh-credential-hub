<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { NCard, NSpace, NTag, NButton, NEmpty, NSpin, NText, NIcon, NPopconfirm, NBadge, NVirtualList, useMessage } from 'naive-ui'
import { CreateOutline, TrashOutline, DesktopOutline, AddOutline, CopyOutline } from '@vicons/ionicons5'
import type { Connection, Tag } from '@shared/types'
import { useTagStore } from '../../stores/useTagStore'
import { useConnectionStore } from '../../stores/useConnectionStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { cloneConnection } from '../../api/ipc'

const message = useMessage()

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

// 虚拟滚动配置
const virtualListRef = ref<InstanceType<typeof NVirtualList> | null>(null)
const itemSize = 160 // 每个连接卡片的高度（包括间距）
const visibleCount = ref(10) // 初始可见项目数

let handleResize: () => void

onMounted(async () => {
  await tagStore.fetchTags()
  for (const conn of props.connections) {
    const tags = await tagStore.fetchTagsByConnection(conn.id)
    connectionTagMap.value[conn.id] = tags
  }
  
  // 监听窗口大小变化以调整可见项目数
  handleResize = () => {
    const windowHeight = window.innerHeight
    visibleCount.value = Math.max(5, Math.floor(windowHeight / itemSize) + 2)
  }
  
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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

async function handleClone(id: string): Promise<void> {
  try {
    const clonedConnection = await cloneConnection(id)
    if (clonedConnection) {
      // 添加到连接列表
      await connectionStore.addConnection(clonedConnection)
      message.success('连接克隆成功')
    } else {
      message.error('克隆连接失败')
    }
  } catch (error) {
    message.error('克隆连接失败: ' + (error as Error).message)
  }
}

// 虚拟滚动渲染函数
function renderConnection(conn: Connection) {
  return h(NCard, {
    size: 'small',
    class: ['connection-card', { 'connection-card--dark': isDark.value, 'connection-card--light': !isDark.value }],
    style: { marginBottom: '12px' },
    'body-style': { padding: '16px' }
  }, {
    header: () => h('div', { class: 'card-header' }, [
      h('div', { class: 'card-title' }, [
        h(NIcon, { size: 18, component: DesktopOutline }, {}),
        h(NText, { strong: true, class: 'card-name' }, conn.name)
      ]),
      h(NSpace, null, {
        default: () => [
          h(NButton, {
            text: true,
            size: 'small',
            class: 'btn-connect',
            onClick: () => emit('connect', conn.id)
          }, { default: () => '连接' }),
          h(NButton, {
            text: true,
            size: 'small',
            class: 'btn-secondary',
            onClick: () => emit('edit', conn.id)
          }, { default: () => '编辑' }),
          h(NButton, {
            text: true,
            size: 'small',
            class: 'btn-secondary',
            onClick: () => handleClone(conn.id)
          }, { default: () => '克隆' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(conn.id)
          }, {
            trigger: () => h(NButton, {
              text: true,
              size: 'small',
              class: 'btn-danger'
            }, { default: () => '删除' }),
            default: () => '确定删除此连接？'
          })
        ]
      })
    ]),
    default: () => h('div', { class: 'card-content' }, [
      h('div', { class: 'info-row' }, [
        h('span', { class: 'label' }, '主机'),
        h(NText, { code: true, style: { fontSize: '13px' } }, `${conn.host}:${conn.port}`)
      ]),
      h('div', { class: 'info-row' }, [
        h('span', { class: 'label' }, '用户'),
        h(NText, { class: 'info-value' }, conn.username)
      ]),
      h('div', { class: 'info-row' }, [
        h('span', { class: 'label' }, '认证'),
        h(NTag, {
          type: conn.authType === 'password' ? 'success' : conn.authType === 'publickey' ? 'warning' : 'info',
          size: 'small',
          style: { borderRadius: '9999px', fontSize: '12px' }
        }, { default: () => getAuthTypeLabel(conn.authType) })
      ]),
      conn.description ? h('div', { class: 'info-row' }, [
        h('span', { class: 'label' }, '备注'),
        h(NText, { depth: 3, style: { fontSize: '13px' } }, conn.description)
      ]) : null
    ])
  })
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

    <div v-else>
      <NVirtualList
        ref="virtualListRef"
        :data="props.connections"
        :item-size="itemSize"
        :visible-count="visibleCount"
        style="height: calc(100vh - 200px)"
      >
        <template #default="{ data }">
          <div style="padding: 0 16px">
            {{ renderConnection(data) }}
          </div>
        </template>
      </NVirtualList>
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
