<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NIcon,
  NButton,
  NSpace,
  NInput,
  NDivider,
  NText
} from 'naive-ui'
import {
  ServerOutline,
  PricetagOutline,
  FolderOutline,
  SettingsOutline,
  SearchOutline,
  AddOutline
} from '@vicons/ionicons5'
import type { MenuOption } from 'naive-ui'
import { h } from 'vue'
import { useConnectionStore } from '../stores/useConnectionStore'
import ConnectionList from '../components/connection/ConnectionList.vue'
import ConnectionForm from '../components/connection/ConnectionForm.vue'
import TagManager from '../components/tag/TagManager.vue'
import GroupManager from '../components/group/GroupManager.vue'

const connectionStore = useConnectionStore()

// 菜单选项
const menuOptions: MenuOption[] = [
  {
    label: '连接管理',
    key: 'connections',
    icon: () => h(NIcon, null, { default: () => h(ServerOutline) })
  },
  {
    label: '标签管理',
    key: 'tags',
    icon: () => h(NIcon, null, { default: () => h(PricetagOutline) })
  },
  {
    label: '分组管理',
    key: 'groups',
    icon: () => h(NIcon, null, { default: () => h(FolderOutline) })
  },
  {
    label: '终端配置',
    key: 'terminals',
    icon: () => h(NIcon, null, { default: () => h(SettingsOutline) })
  }
]

const activeMenu = ref('connections')
const showForm = ref(false)
const editingConnection = ref<string | null>(null)

onMounted(() => {
  connectionStore.fetchConnections()
})

function handleMenuSelect(key: string): void {
  activeMenu.value = key
}

function handleSearch(value: string): void {
  connectionStore.searchConnections(value)
}

function handleAddConnection(): void {
  editingConnection.value = null
  showForm.value = true
}

function handleEditConnection(id: string): void {
  editingConnection.value = id
  showForm.value = true
}

function handleFormClose(): void {
  showForm.value = false
  editingConnection.value = null
}
</script>

<template>
  <NLayout has-sider style="height: 100vh">
    <!-- 侧边栏 -->
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="200"
      :native-scrollbar="false"
      style="max-height: 100vh"
    >
      <div class="sider-header">
        <NText strong class="app-title">SSH Hub</NText>
      </div>
      <NDivider style="margin: 0" />
      <NMenu
        :value="activeMenu"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />
    </NLayoutSider>

    <!-- 主内容区 -->
    <NLayoutContent style="padding: 24px">
      <!-- 连接管理页面 -->
      <template v-if="activeMenu === 'connections'">
        <NSpace justify="space-between" style="margin-bottom: 16px">
          <NInput
            v-model:value="connectionStore.searchKeyword"
            placeholder="搜索连接..."
            clearable
            style="width: 300px"
            @update:value="handleSearch"
          >
            <template #prefix>
              <NIcon :component="SearchOutline" />
            </template>
          </NInput>

          <NButton type="primary" @click="handleAddConnection">
            <template #icon>
              <NIcon :component="AddOutline" />
            </template>
            新建连接
          </NButton>
        </NSpace>

        <ConnectionList
          :connections="connectionStore.filteredConnections"
          :loading="connectionStore.loading"
          @edit="handleEditConnection"
        />
      </template>

      <!-- 标签管理页面 -->
      <TagManager v-else-if="activeMenu === 'tags'" />

      <!-- 分组管理页面 -->
      <GroupManager v-else-if="activeMenu === 'groups'" />

      <!-- 终端配置页面占位 -->
      <div v-else-if="activeMenu === 'terminals'" class="placeholder">
        <NText depth="3">终端配置功能开发中...</NText>
      </div>
    </NLayoutContent>

    <!-- 连接表单弹窗 -->
    <ConnectionForm
      v-model:show="showForm"
      :connection-id="editingConnection"
      @close="handleFormClose"
    />
  </NLayout>
</template>

<style scoped>
.sider-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.app-title {
  font-size: 16px;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}
</style>
