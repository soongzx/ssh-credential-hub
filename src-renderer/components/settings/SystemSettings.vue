<script setup lang="ts">
import {
  NCard,
  NSpace,
  NButton,
  NText,
  NDivider,
  NSwitch,
  NGrid,
  NGi
} from 'naive-ui'
import { useThemeStore } from '../../stores/useThemeStore'

const themeStore = useThemeStore()
</script>

<template>
  <div class="settings-container">
    <!-- 外观设置 -->
    <NCard
      title="外观"
      :bordered="true"
      style="background: #f2f1ed; border: 1px solid rgba(38, 37, 30, 0.1); border-radius: 8px"
    >
      <template #header-extra>
        <NText depth="3" style="font-size: 13px">个性化设置</NText>
      </template>

      <NDivider style="margin: 12px 0; border-color: rgba(38, 37, 30, 0.1)" />

      <div class="setting-item">
        <div class="setting-info">
          <NText style="color: #26251e; font-size: 14px">深色模式</NText>
          <NText depth="3" style="font-size: 13px">
            开启后使用深色主题，减少眼睛疲劳
          </NText>
        </div>
        <NSwitch
          :value="themeStore.themeMode === 'dark'"
          @update:value="themeStore.toggleTheme()"
        />
      </div>

      <NDivider style="margin: 12px 0; border-color: rgba(38, 37, 30, 0.1)" />

      <div class="setting-item">
        <div class="setting-info">
          <NText style="color: #26251e; font-size: 14px">当前主题</NText>
          <NText depth="3" style="font-size: 13px">
            {{ themeStore.themeMode === 'dark' ? '深色模式' : '浅色模式' }}
          </NText>
        </div>
        <NSpace>
          <NButton
            :type="themeStore.themeMode === 'light' ? 'primary' : 'tertiary'"
            size="small"
            style="border-radius: 8px"
            @click="themeStore.setTheme('light')"
          >
            浅色
          </NButton>
          <NButton
            :type="themeStore.themeMode === 'dark' ? 'primary' : 'tertiary'"
            size="small"
            style="border-radius: 8px"
            @click="themeStore.setTheme('dark')"
          >
            深色
          </NButton>
        </NSpace>
      </div>
    </NCard>

    <!-- 关于 -->
    <NCard
      title="关于"
      :bordered="true"
      style="margin-top: 16px; background: #f2f1ed; border: 1px solid rgba(38, 37, 30, 0.1); border-radius: 8px"
    >
      <NDivider style="margin: 12px 0; border-color: rgba(38, 37, 30, 0.1)" />

      <div class="about-info">
        <NText strong style="color: #26251e; font-size: 16px">SSH Credential Hub</NText>
        <NText depth="3" style="font-size: 13px; display: block; margin-top: 4px">
          Windows SSH 连接管理工具
        </NText>
        <NText depth="3" style="font-size: 13px; display: block; margin-top: 8px">
          版本 0.1.0
        </NText>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 640px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.about-info {
  padding: 8px 0;
}
</style>
