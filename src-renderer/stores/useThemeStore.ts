/**
 * 主题状态管理 - Molokai 深色主题 + Cursor 浅色主题
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'

// Molokai 配色方案
const molokaiColors = {
  // 基础色
  primaryColor: '#FD971F',           // 橙色 - 主要强调
  primaryColorHover: '#FFE4B5',       // 浅橙
  primaryColorPressed: '#AE8B00',     // 深橙
  primaryColorSuppl: '#FD971F',       // 橙色补充

  // 背景色
  bodyColor: '#1E1E1E',             // 整体背景
  cardColor: '#272822',              // 卡片背景
  modalColor: '#2D2D2D',             // 弹窗背景
  popoverColor: '#272822',           // 弹出层背景
  tableColor: '#272822',             // 表格背景
  inputColor: '#272822',             // 输入框背景
  actionColor: '#2D2D2D',            // 操作区域背景

  // 边框
  borderColor: '#49483E',            // 边框色
  dividerColor: '#49483E',            // 分隔线

  // 悬停
  hoverColor: '#3E3D32',            // 悬停背景

  // 文字
  textColorBase: '#F8F8F2',          // 主文字（近白色）
  textColor1: '#F8F8F0',            // 文字1
  textColor2: '#A6A29E',             // 文字2（次要）
  textColor3: '#75715E',             // 文字3（注释/禁用）
  textColorDisabled: '#49483E',       // 禁用文字

  // Tag 颜色
  infoColor: '#66D9EF',              // 青色
  successColor: '#A6E22E',            // 绿色
  warningColor: '#FD971F',             // 橙色
  errorColor: '#F92672',              // 红色
}

// Cursor 浅色配色
const cursorLightColors = {
  primaryColor: '#f54e00',           // 橙色
  primaryColorHover: '#ff6a1a',
  primaryColorPressed: '#d94400',
  primaryColorSuppl: '#ff8533',
  bodyColor: '#f2f1ed',
  cardColor: '#f2f1ed',
  modalColor: '#ffffff',
  popoverColor: '#ffffff',
  tableColor: '#ffffff',
  inputColor: '#ffffff',
  actionColor: '#ffffff',
  borderColor: 'rgba(38, 37, 30, 0.1)',
  dividerColor: 'rgba(38, 37, 30, 0.1)',
  hoverColor: 'rgba(38, 37, 30, 0.05)',
  textColorBase: '#26251e',
  textColor1: '#26251e',
  textColor2: '#a6a29c',
  textColor3: '#75715e',
  textColorDisabled: '#b8b8b0',
  infoColor: '#1084d9',
  successColor: '#1f8a65',
  warningColor: '#c08532',
  errorColor: '#cf2d56'
}

export const useThemeStore = defineStore('theme', () => {
  const themeMode = ref<'light' | 'dark'>('dark')

  // 获取当前主题配置
  const theme = () => {
    if (themeMode.value === 'dark') {
      return {
        ...darkTheme,
        ...molokaiColors,
        name: 'molokai-dark'
      }
    }
    return {
      ...lightTheme,
      ...cursorLightColors,
      name: 'cursor-light'
    }
  }

  // 切换主题
  function toggleTheme() {
    themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark'
    saveTheme()
  }

  // 设置主题
  function setTheme(mode: 'light' | 'dark') {
    themeMode.value = mode
    saveTheme()
  }

  // 保存主题到 localStorage
  function saveTheme() {
    localStorage.setItem('theme-mode', themeMode.value)
  }

  // 从 localStorage 加载主题
  function loadTheme() {
    const saved = localStorage.getItem('theme-mode') as 'light' | 'dark' | null
    if (saved) {
      themeMode.value = saved
    }
  }

  // 初始化
  loadTheme()

  return {
    themeMode,
    theme,
    toggleTheme,
    setTheme
  }
})
