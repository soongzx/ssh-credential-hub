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
  NDivider,
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
import ConnectionFilter from '../components/connection/ConnectionFilter.vue'
import SshConfigImport from '../components/connection/SshConfigImport.vue'
import CsvImport from '../components/connection/CsvImport.vue'
import TagManager from '../components/tag/TagManager.vue'
import GroupManager from '../components/group/GroupManager.vue'
import SystemSettings from '../components/settings/SystemSettings.vue'

const connectionStore = useConnectionStore()
const themeStore = useThemeStore()

const menuOptions: MenuOption[] = [
  {
    label: '连接列表',
    key: 'connections',
    icon: () => h(NIcon, null, { default: () => h(ServerOutline) })
  },
  {
    label: '信息导入',
    key: 'import',
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
const showCsvImport = ref(false)

const isDark = computed(() => themeStore.isDark)

onMounted(() => {
  connectionStore.fetchConnections()
})

function handleMenuSelect(key: string): void {
  if (key === 'connections-add') {
    editingConnection.value = null
    showConnectionForm.value = true
    showSshConfigImport.value = false
    showCsvImport.value = false
    activeMenu.value = 'connections'
    return
  }
  if (key === 'connections-ssh-config') {
    showSshConfigImport.value = true
    showConnectionForm.value = false
    showCsvImport.value = false
    activeMenu.value = 'import'
    return
  }
  if (key === 'connections-csv') {
    showCsvImport.value = true
    showSshConfigImport.value = false
    showConnectionForm.value = false
    activeMenu.value = 'import'
    return
  }
  if (key === 'import') {
    // 当点击信息导入菜单项时，显示导入页面而不是连接列表
    showSshConfigImport.value = false
    showConnectionForm.value = false
    showCsvImport.value = false
    activeMenu.value = 'import'
    return
  }
  activeMenu.value = key
  showSshConfigImport.value = false
  showConnectionForm.value = false
  showCsvImport.value = false
}

function handleSearch(value: string): void {
  connectionStore.searchConnections(value)
}

function handleConnectionFormBack(): void {
  showConnectionForm.value = false
  activeMenu.value = 'import'
}
</script>

<template>
  <NConfigProvider :theme="themeStore.theme" :theme-overrides="themeStore.themeOverrides">
    <NLayout has-sider class="app-layout" :class="{ 'app-layout--dark': isDark, 'app-layout--light': !isDark }">
      <NLayoutSider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="232"
        :native-scrollbar="false"
        class="app-sider"
      >
        <div class="sider-header">
          <div class="logo">
            <span class="logo-icon">⬡</span>
            <NText strong class="logo-text">SSH Hub</NText>
          </div>
        </div>

        <NDivider class="sider-divider" />

        <NMenu
          :value="activeMenu"
          :collapsed-width="64"
          :collapsed-icon-size="20"
          :options="menuOptions"
          @update:value="handleMenuSelect"
        />

        <div class="sider-footer">
          <NDivider class="sider-divider" />
          <div class="theme-toggle" @click="themeStore.toggleTheme()">
            <NIcon :component="isDark ? SunnyOutline : MoonOutline" size="18" />
            <NText depth="3" class="theme-toggle-label">
              {{ 
                themeStore.themeMode === 'dark' ? '深色模式' : 
                themeStore.themeMode === 'light' ? '浅色模式' :
                themeStore.themeMode === 'black' ? '黑色主题' :
                themeStore.themeMode === 'blue' ? '蓝色主题' : '黄色主题'
              }}
            </NText>
          </div>
        </div>
      </NLayoutSider>

      <NLayoutContent class="app-content">
        <div class="app-header">
          <div class="header-left">
            <NText strong class="header-title">
              {{ activeMenu === 'connections' ? '连接列表' :
                 activeMenu === 'import' ? '信息导入' :
                 activeMenu === 'tags' ? '标签管理' :
                 activeMenu === 'groups' ? '分组管理' :
                 activeMenu === 'settings' ? '系统设置' : '' }}
            </NText>
          </div>
          <div class="header-right">
            <template v-if="activeMenu === 'connections'">
              <NInput
                v-model:value="connectionStore.searchKeyword"
                placeholder="搜索连接..."
                clearable
                style="width: 260px"
                @update:value="handleSearch"
              >
                <template #prefix>
                  <NIcon :component="SearchOutline" />
                </template>
              </NInput>
            </template>
          </div>
        </div>

        <div class="page-content">
          <template v-if="activeMenu === 'connections'">
            <ConnectionForm
              v-if="showConnectionForm"
              :connection-id="editingConnection"
              @back="showConnectionForm = false"
            />
            <div v-else class="connection-page-content">
              <ConnectionFilter />
              <ConnectionList
                :connections="connectionStore.filteredConnections"
                :loading="connectionStore.loading"
                @edit="(id) => { editingConnection = id; showConnectionForm = true }"
              />
            </div>
          </template>

          <template v-else-if="activeMenu === 'import'">
            <SshConfigImport v-if="showSshConfigImport" />
            <CsvImport v-else-if="showCsvImport" />
            <ConnectionForm
              v-else-if="showConnectionForm"
              :connection-id="editingConnection"
              @back="handleConnectionFormBack"
            />
            <div v-else class="import-page-content">
              <NCard title="信息导入" :bordered="false" style="border-radius: 8px">
                <div style="text-align: center; padding: 40px 20px;">
                  <NIcon :component="ServerOutline" size="48" color="#1890ff" style="margin-bottom: 20px;" />
                  <NText depth="2" style="font-size: 16px; margin-bottom: 10px;">
                    选择导入方式
                  </NText>
                  <NText depth="3" style="font-size: 14px;">
                    从 SSH Config 或 CSV 文件导入连接信息
                  </NText>
                  <NSpace style="margin-top: 20px;">
                    <NButton @click="showSshConfigImport = true; activeMenu = 'import'">
                      从 SSH Config 导入
                    </NButton>
                    <NButton @click="showCsvImport = true; activeMenu = 'import'">
                      从 CSV 导入
                    </NButton>
                  </NSpace>
                </div>
              </NCard>
            </div>
          </template>

          <TagManager v-else-if="activeMenu === 'tags'" />
          <GroupManager v-else-if="activeMenu === 'groups'" />
          <SystemSettings v-else-if="activeMenu === 'settings'" />
        </div>
      </NLayoutContent>
    </NLayout>
  </NConfigProvider>
</template>

<style scoped>
.app-layout {
  height: 100vh;
}

.app-layout--dark {
  --bg-base: #0A0A0B;
  --bg-sider: #0E0E10;
  --bg-header: #0E0E10;
  --bg-content: #0A0A0B;
  --border-subtle: #1E1E22;
  --border-default: #2A2A2E;
  --text-brand: #5BA4F5;
  --text-primary: #E8E8EC;
  --text-secondary: #8C8C96;
  --text-tertiary: #5A5A66;
  --hover-bg: #1A1A1E;
  --logo-glow: rgba(91, 164, 245, 0.15);
}

.app-layout--light {
  --bg-base: #FAF6F0;
  --bg-sider: #F5EFE6;
  --bg-header: #F8F3EB;
  --bg-content: #FAF6F0;
  --border-subtle: #EDE6DA;
  --border-default: #E0D6C6;
  --text-brand: #C87A30;
  --text-primary: #2E261E;
  --text-secondary: #8A7E6E;
  --text-tertiary: #A89E90;
  --hover-bg: #FFF5EA;
  --logo-glow: rgba(200, 122, 48, 0.12);
}

.app-sider {
  background: var(--bg-sider) !important;
  border-right: 1px solid var(--border-subtle) !important;
}

.sider-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 22px;
  color: var(--text-brand);
  filter: drop-shadow(0 0 8px var(--logo-glow));
  line-height: 1;
}

.logo-text {
  font-size: 17px;
  letter-spacing: -0.5px;
  color: var(--text-primary) !important;
}

.sider-divider {
  margin: 0 !important;
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
  color: var(--text-secondary);
}

.theme-toggle:hover {
  background: var(--hover-bg);
}

.theme-toggle-label {
  margin-left: 10px;
  font-size: 13px;
}

.app-content {
  background: var(--bg-content) !important;
}

.connection-page-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-header);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 16px !important;
  color: var(--text-primary) !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-content {
  padding: 24px 28px;
}
</style>
