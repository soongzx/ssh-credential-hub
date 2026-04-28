<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NIcon,
  NButton,
  NSpace,
  NInput,
  NText,
  NConfigProvider,
  NSwitch,
  NBadge
} from 'naive-ui'
import {
  ServerOutline,
  PricetagOutline,
  FolderOutline,
  SettingsOutline,
  SearchOutline,
  AddOutline,
  DocumentTextOutline,
  CloudDownloadOutline,
  SunnyOutline,
  MoonOutline,
  CogOutline
} from '@vicons/ionicons5'
import type { MenuOption } from 'naive-ui'
import { h } from 'vue'
import { useConnectionStore } from '../stores/useConnectionStore'
import { useThemeStore } from '../stores/useThemeStore'
import ConnectionList from '../components/connection/ConnectionList.vue'
import ConnectionForm from '../components/connection/ConnectionForm.vue'
import SshConfigImport from '../components/connection/SshConfigImport.vue'
import TagManager from '../components/tag/TagManager.vue'
import GroupManager from '../components/group/GroupManager.vue'
import SystemSettings from '../components/settings/SystemSettings.vue'

const connectionStore = useConnectionStore()
const themeStore = useThemeStore()

// 菜单选项
const menuOptions: MenuOption[] = [
  {
    label: '连接管理',
    key: 'connections',
    icon: () => h(NIcon, null, { default: () => h(ServerOutline) }),
    children: [
      {
        label: '添加连接',
        key: 'connections-add',
        icon: () => h(NIcon, null, { default: () => h(AddOutline) })
      },
      {
        label: '从 SSH Config 导入',
        key: 'connections-ssh-config',
        icon: () => h(NIcon, null, { default: () => h(DocumentTextOutline) })
      },
      {
        label: '从 CSV 导入',
        key: 'connections-csv',
        icon: () => h(NIcon, null, { default: () => h(CloudDownloadOutline) })
      }
    ]
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
    label: '系统设置',
    key: 'settings',
    icon: () => h(NIcon, null, { default: () => h(CogOutline) })
  }
]

const activeMenu = ref('connections')
const showForm = ref(false)
const editingConnection = ref<string | null>(null)
const showSshConfigImport = ref(false)
const showConnectionForm = ref(false)

onMounted(() => {
  connectionStore.fetchConnections()
})

function handleMenuSelect(key: string): void {
  // 处理连接管理子菜单
  if (key === 'connections-add') {
    editingConnection.value = null
    showConnectionForm.value = true
    showSshConfigImport.value = false
    return
  }
  if (key === 'connections-ssh-config') {
    showSshConfigImport.value = true
    showConnectionForm.value = false
    activeMenu.value = 'connections'
    return
  }
  if (key === 'connections-csv') {
    console.log('从 CSV 导入')
    return
  }
  // 其他菜单项
  activeMenu.value = key
  showSshConfigImport.value = false
  showConnectionForm.value = false
}

function handleSearch(value: string): void {
  connectionStore.searchConnections(value)
}
</script>

<template>
  <NConfigProvider :theme="themeStore.theme">
    <NLayout has-sider style="height: 100vh; background: #f2f1ed">
      <!-- 侧边栏 - Cursor 风格 -->
      <NLayoutSider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="220"
        :native-scrollbar="false"
        style="background: #f2f1ed; border-right: 1px solid rgba(38, 37, 30, 0.1)"
      >
        <!-- Logo 区域 -->
        <div class="sider-header">
          <div class="logo">
            <NText strong style="font-size: 18px; letter-spacing: -0.5px; color: #26251e">
              SSH Hub
            </NText>
          </div>
        </div>

        <NDivider style="margin: 0; border-color: rgba(38, 37, 30, 0.1)" />

        <!-- 菜单 -->
        <NMenu
          :value="activeMenu"
          :collapsed-width="64"
          :collapsed-icon-size="20"
          :options="menuOptions"
          @update:value="handleMenuSelect"
        />

        <!-- 底部主题切换 -->
        <div class="sider-footer">
          <NDivider style="margin: 0; border-color: rgba(38, 37, 30, 0.1)" />
          <div class="theme-toggle" @click="themeStore.toggleTheme()">
            <NIcon :component="themeStore.themeMode === 'dark' ? SunnyOutline : MoonOutline" size="18" />
            <NText depth="3" style="margin-left: 8px; font-size: 13px">
              {{ themeStore.themeMode === 'dark' ? '浅色模式' : '深色模式' }}
            </NText>
          </div>
        </div>
      </NLayoutSider>

      <!-- 主内容区 -->
      <NLayoutContent style="background: #f2f1ed; padding: 0">
        <!-- 顶部栏 -->
        <div class="header">
          <div class="header-left">
            <NText strong style="font-size: 16px; color: #26251e">
              {{ activeMenu === 'connections' ? '连接列表' :
                 activeMenu === 'tags' ? '标签管理' :
                 activeMenu === 'groups' ? '分组管理' :
                 activeMenu === 'settings' ? '系统设置' : '' }}
            </NText>
          </div>
          <div class="header-right">
            <!-- 搜索框 - 仅连接管理页面显示 -->
            <template v-if="activeMenu === 'connections'">
              <NInput
                v-model:value="connectionStore.searchKeyword"
                placeholder="搜索连接..."
                clearable
                style="width: 240px"
                @update:value="handleSearch"
              >
                <template #prefix>
                  <NIcon :component="SearchOutline" />
                </template>
              </NInput>
            </template>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="content">
          <!-- 连接管理页面 -->
          <template v-if="activeMenu === 'connections'">
            <SshConfigImport v-if="showSshConfigImport" />
            <ConnectionForm
              v-else-if="showConnectionForm"
              :connection-id="editingConnection"
              @back="showConnectionForm = false"
            />
            <ConnectionList
              v-else
              :connections="connectionStore.filteredConnections"
              :loading="connectionStore.loading"
              @edit="(id) => { editingConnection = id; showConnectionForm = true }"
            />
          </template>

          <!-- 标签管理页面 -->
          <TagManager v-else-if="activeMenu === 'tags'" />

          <!-- 分组管理页面 -->
          <GroupManager v-else-if="activeMenu === 'groups'" />

          <!-- 系统设置页面 -->
          <SystemSettings v-else-if="activeMenu === 'settings'" />
        </div>
      </NLayoutContent>
    </NLayout>
  </NConfigProvider>
</template>

<style scoped>
.sider-header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
}

.sider-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.theme-toggle {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  transition: background 150ms ease;
}

.theme-toggle:hover {
  background: rgba(38, 37, 30, 0.05);
}

.header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid rgba(38, 37, 30, 0.1);
  background: #f2f1ed;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content {
  padding: 24px;
}
</style>
