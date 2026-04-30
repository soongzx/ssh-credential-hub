import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

// 金属深色主题
const metalDarkColors: GlobalThemeOverrides['common'] = {
  primaryColor: '#5BA4F5',
  primaryColorHover: '#7BB8FF',
  primaryColorPressed: '#4090E0',
  primaryColorSuppl: '#5BA4F5',

  bodyColor: '#0A0A0B',
  cardColor: '#141416',
  modalColor: '#1A1A1E',
  popoverColor: '#1A1A1E',
  tableColor: '#141416',
  inputColor: '#1C1C20',
  actionColor: '#1A1A1E',

  borderColor: '#2A2A2E',
  dividerColor: '#222226',

  hoverColor: '#1E1E22',

  textColorBase: '#E8E8EC',
  textColor1: '#F0F0F4',
  textColor2: '#8C8C96',
  textColor3: '#5A5A66',
  textColorDisabled: '#3A3A42',

  infoColor: '#5BA4F5',
  successColor: '#52D9A0',
  warningColor: '#E8A84C',
  errorColor: '#F05656',

  borderRadius: '6px',
  borderRadiusSmall: '4px',

  boxShadow1: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)',
  boxShadow2: '0 3px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4)',
  boxShadow3: '0 10px 30px rgba(0, 0, 0, 0.6), 0 6px 10px rgba(0, 0, 0, 0.4)',

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
  fontSizeMini: '12px',
  fontSizeSmall: '13px',
  fontSizeMedium: '14px',
  fontSizeLarge: '15px',
  fontSizeHuge: '16px',
}

// 温暖浅色主题
const warmLightColors: GlobalThemeOverrides['common'] = {
  primaryColor: '#C87A30',
  primaryColorHover: '#D99040',
  primaryColorPressed: '#B06820',
  primaryColorSuppl: '#C87A30',

  bodyColor: '#FAF6F0',
  cardColor: '#FFFCF7',
  modalColor: '#FFFCF7',
  popoverColor: '#FFFCF7',
  tableColor: '#FFFCF7',
  inputColor: '#FFFFFF',
  actionColor: '#FFF9F2',

  borderColor: '#E8DFD2',
  dividerColor: '#EDE6DA',

  hoverColor: '#FFF5EA',

  textColorBase: '#3A3228',
  textColor1: '#2E261E',
  textColor2: '#8A7E6E',
  textColor3: '#A89E90',
  textColorDisabled: '#C8C0B4',

  infoColor: '#4A90C8',
  successColor: '#4AA876',
  warningColor: '#C88A30',
  errorColor: '#C85050',

  borderRadius: '8px',
  borderRadiusSmall: '6px',

  boxShadow1: '0 1px 3px rgba(58, 50, 40, 0.08), 0 1px 2px rgba(58, 50, 40, 0.06)',
  boxShadow2: '0 3px 8px rgba(58, 50, 40, 0.1), 0 2px 4px rgba(58, 50, 40, 0.06)',
  boxShadow3: '0 10px 24px rgba(58, 50, 40, 0.12), 0 6px 10px rgba(58, 50, 40, 0.06)',

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
  fontSizeMini: '12px',
  fontSizeSmall: '13px',
  fontSizeMedium: '14px',
  fontSizeLarge: '15px',
  fontSizeHuge: '16px',
}

// 黑色主题
const blackThemeColors: GlobalThemeOverrides['common'] = {
  primaryColor: '#FFFFFF',
  primaryColorHover: '#FFFFFF',
  primaryColorPressed: '#FFFFFF',
  primaryColorSuppl: '#FFFFFF',

  bodyColor: '#000000',
  cardColor: '#111111',
  modalColor: '#111111',
  popoverColor: '#111111',
  tableColor: '#111111',
  inputColor: '#222222',
  actionColor: '#111111',

  borderColor: '#333333',
  dividerColor: '#333333',

  hoverColor: '#222222',

  textColorBase: '#FFFFFF',
  textColor1: '#FFFFFF',
  textColor2: '#AAAAAA',
  textColor3: '#888888',
  textColorDisabled: '#666666',

  infoColor: '#FFFFFF',
  successColor: '#00FF00',
  warningColor: '#FFFF00',
  errorColor: '#FF0000',

  borderRadius: '4px',
  borderRadiusSmall: '3px',

  boxShadow1: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)',
  boxShadow2: '0 3px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4)',
  boxShadow3: '0 10px 30px rgba(0, 0, 0, 0.6), 0 6px 10px rgba(0, 0, 0, 0.4)',

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
  fontSizeMini: '12px',
  fontSizeSmall: '13px',
  fontSizeMedium: '14px',
  fontSizeLarge: '15px',
  fontSizeHuge: '16px',
}

// 蓝色主题
const blueThemeColors: GlobalThemeOverrides['common'] = {
  primaryColor: '#1E90FF',
  primaryColorHover: '#4682B4',
  primaryColorPressed: '#191970',
  primaryColorSuppl: '#1E90FF',

  bodyColor: '#001F3F',
  cardColor: '#002B5B',
  modalColor: '#003366',
  popoverColor: '#003366',
  tableColor: '#002B5B',
  inputColor: '#001F3F',
  actionColor: '#002B5B',

  borderColor: '#004080',
  dividerColor: '#004080',

  hoverColor: '#003366',

  textColorBase: '#FFFFFF',
  textColor1: '#FFFFFF',
  textColor2: '#B0E0E6',
  textColor3: '#87CEEB',
  textColorDisabled: '#696969',

  infoColor: '#1E90FF',
  successColor: '#32CD32',
  warningColor: '#FFD700',
  errorColor: '#FF4500',

  borderRadius: '6px',
  borderRadiusSmall: '4px',

  boxShadow1: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)',
  boxShadow2: '0 3px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4)',
  boxShadow3: '0 10px 30px rgba(0, 0, 0, 0.6), 0 6px 10px rgba(0, 0, 0, 0.4)',

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
  fontSizeMini: '12px',
  fontSizeSmall: '13px',
  fontSizeMedium: '14px',
  fontSizeLarge: '15px',
  fontSizeHuge: '16px',
}

// 黄色主题
const yellowThemeColors: GlobalThemeOverrides['common'] = {
  primaryColor: '#FFD700',
  primaryColorHover: '#FFA500',
  primaryColorPressed: '#FF8C00',
  primaryColorSuppl: '#FFD700',

  bodyColor: '#333300',
  cardColor: '#444400',
  modalColor: '#555500',
  popoverColor: '#555500',
  tableColor: '#444400',
  inputColor: '#333300',
  actionColor: '#444400',

  borderColor: '#666600',
  dividerColor: '#666600',

  hoverColor: '#555500',

  textColorBase: '#FFFF00',
  textColor1: '#FFFF00',
  textColor2: '#FFFF99',
  textColor3: '#FFFFCC',
  textColorDisabled: '#999900',

  infoColor: '#FFD700',
  successColor: '#32CD32',
  warningColor: '#FFA500',
  errorColor: '#FF0000',

  borderRadius: '6px',
  borderRadiusSmall: '4px',

  boxShadow1: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4)',
  boxShadow2: '0 3px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4)',
  boxShadow3: '0 10px 30px rgba(0, 0, 0, 0.6), 0 6px 10px rgba(0, 0, 0, 0.4)',

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
  fontSizeMini: '12px',
  fontSizeSmall: '13px',
  fontSizeMedium: '14px',
  fontSizeLarge: '15px',
  fontSizeHuge: '16px',
}

const metalDarkMenu: GlobalThemeOverrides['Menu'] = {
  color: '#0A0A0B',
  itemTextColor: '#8C8C96',
  itemTextColorHover: '#E8E8EC',
  itemTextColorActive: '#5BA4F5',
  itemTextColorChildActive: '#5BA4F5',
  itemColorHover: '#1E1E22',
  itemColorActive: '#141420',
  itemIconColor: '#6A6A76',
  itemIconColorHover: '#E8E8EC',
  itemIconColorActive: '#5BA4F5',
  itemIconColorChildActive: '#5BA4F5',
  borderColorHorizontal: '#222226',
  arrowColor: '#5A5A66',
  arrowColorHover: '#E8E8EC',
  arrowColorActive: '#5BA4F5',
  arrowColorChildActive: '#5BA4F5',
}

const warmLightMenu: GlobalThemeOverrides['Menu'] = {
  color: '#FAF6F0',
  itemTextColor: '#8A7E6E',
  itemTextColorHover: '#3A3228',
  itemTextColorActive: '#C87A30',
  itemTextColorChildActive: '#C87A30',
  itemColorHover: '#FFF5EA',
  itemColorActive: '#FFF0E0',
  itemIconColor: '#A89E90',
  itemIconColorHover: '#3A3228',
  itemIconColorActive: '#C87A30',
  itemIconColorChildActive: '#C87A30',
  borderColorHorizontal: '#EDE6DA',
  arrowColor: '#A89E90',
  arrowColorHover: '#3A3228',
  arrowColorActive: '#C87A30',
  arrowColorChildActive: '#C87A30',
}

// 黑色主题菜单
const blackThemeMenu: GlobalThemeOverrides['Menu'] = {
  color: '#000000',
  itemTextColor: '#AAAAAA',
  itemTextColorHover: '#FFFFFF',
  itemTextColorActive: '#FFFFFF',
  itemTextColorChildActive: '#FFFFFF',
  itemColorHover: '#222222',
  itemColorActive: '#111111',
  itemIconColor: '#666666',
  itemIconColorHover: '#FFFFFF',
  itemIconColorActive: '#FFFFFF',
  itemIconColorChildActive: '#FFFFFF',
  borderColorHorizontal: '#333333',
  arrowColor: '#888888',
  arrowColorHover: '#FFFFFF',
  arrowColorActive: '#FFFFFF',
  arrowColorChildActive: '#FFFFFF',
}

// 蓝色主题菜单
const blueThemeMenu: GlobalThemeOverrides['Menu'] = {
  color: '#001F3F',
  itemTextColor: '#B0E0E6',
  itemTextColorHover: '#FFFFFF',
  itemTextColorActive: '#1E90FF',
  itemTextColorChildActive: '#1E90FF',
  itemColorHover: '#003366',
  itemColorActive: '#002B5B',
  itemIconColor: '#87CEEB',
  itemIconColorHover: '#FFFFFF',
  itemIconColorActive: '#1E90FF',
  itemIconColorChildActive: '#1E90FF',
  borderColorHorizontal: '#004080',
  arrowColor: '#87CEEB',
  arrowColorHover: '#FFFFFF',
  arrowColorActive: '#1E90FF',
  arrowColorChildActive: '#1E90FF',
}

// 黄色主题菜单
const yellowThemeMenu: GlobalThemeOverrides['Menu'] = {
  color: '#333300',
  itemTextColor: '#FFFF99',
  itemTextColorHover: '#FFFF00',
  itemTextColorActive: '#FFD700',
  itemTextColorChildActive: '#FFD700',
  itemColorHover: '#555500',
  itemColorActive: '#444400',
  itemIconColor: '#FFFFCC',
  itemIconColorHover: '#FFFF00',
  itemIconColorActive: '#FFD700',
  itemIconColorChildActive: '#FFD700',
  borderColorHorizontal: '#666600',
  arrowColor: '#FFFFCC',
  arrowColorHover: '#FFFF00',
  arrowColorActive: '#FFD700',
  arrowColorChildActive: '#FFD700',
}

const metalDarkCard: GlobalThemeOverrides['Card'] = {
  color: '#141416',
  colorModal: '#1A1A1E',
  colorPopover: '#1A1A1E',
  borderColor: '#2A2A2E',
  titleTextColor: '#E8E8EC',
  titleFontWeight: '600',
  contentTextColor: '#8C8C96',
  actionColor: '#1C1C20',
  borderRadius: '8px',
}

const warmLightCard: GlobalThemeOverrides['Card'] = {
  color: '#FFFCF7',
  colorModal: '#FFFCF7',
  colorPopover: '#FFFCF7',
  borderColor: '#E8DFD2',
  titleTextColor: '#2E261E',
  titleFontWeight: '600',
  contentTextColor: '#8A7E6E',
  actionColor: '#FFF9F2',
  borderRadius: '10px',
}

// 黑色主题卡片
const blackThemeCard: GlobalThemeOverrides['Card'] = {
  color: '#111111',
  colorModal: '#111111',
  colorPopover: '#111111',
  borderColor: '#333333',
  titleTextColor: '#FFFFFF',
  titleFontWeight: '600',
  contentTextColor: '#AAAAAA',
  actionColor: '#222222',
  borderRadius: '6px',
}

// 蓝色主题卡片
const blueThemeCard: GlobalThemeOverrides['Card'] = {
  color: '#002B5B',
  colorModal: '#003366',
  colorPopover: '#003366',
  borderColor: '#004080',
  titleTextColor: '#FFFFFF',
  titleFontWeight: '600',
  contentTextColor: '#B0E0E6',
  actionColor: '#003366',
  borderRadius: '8px',
}

// 黄色主题卡片
const yellowThemeCard: GlobalThemeOverrides['Card'] = {
  color: '#444400',
  colorModal: '#555500',
  colorPopover: '#555500',
  borderColor: '#666600',
  titleTextColor: '#FFFF00',
  titleFontWeight: '600',
  contentTextColor: '#FFFF99',
  actionColor: '#555500',
  borderRadius: '8px',
}

const metalDarkInput: GlobalThemeOverrides['Input'] = {
  color: '#1C1C20',
  colorFocus: '#1C1C20',
  borderColor: '#2A2A2E',
  borderColorHover: '#3A3A42',
  borderColorFocus: '#5BA4F5',
  textColor: '#E8E8EC',
  placeholderColor: '#5A5A66',
  borderRadius: '6px',
  caretColor: '#5BA4F5',
}

const warmLightInput: GlobalThemeOverrides['Input'] = {
  color: '#FFFFFF',
  colorFocus: '#FFFFFF',
  borderColor: '#E8DFD2',
  borderColorHover: '#D4C8B8',
  borderColorFocus: '#C87A30',
  textColor: '#2E261E',
  placeholderColor: '#A89E90',
  borderRadius: '8px',
  caretColor: '#C87A30',
}

// 黑色主题输入框
const blackThemeInput: GlobalThemeOverrides['Input'] = {
  color: '#222222',
  colorFocus: '#222222',
  borderColor: '#333333',
  borderColorHover: '#444444',
  borderColorFocus: '#FFFFFF',
  textColor: '#FFFFFF',
  placeholderColor: '#AAAAAA',
  borderRadius: '4px',
  caretColor: '#FFFFFF',
}

// 蓝色主题输入框
const blueThemeInput: GlobalThemeOverrides['Input'] = {
  color: '#001F3F',
  colorFocus: '#001F3F',
  borderColor: '#004080',
  borderColorHover: '#0050A0',
  borderColorFocus: '#1E90FF',
  textColor: '#FFFFFF',
  placeholderColor: '#B0E0E6',
  borderRadius: '6px',
  caretColor: '#1E90FF',
}

// 黄色主题输入框
const yellowThemeInput: GlobalThemeOverrides['Input'] = {
  color: '#333300',
  colorFocus: '#333300',
  borderColor: '#666600',
  borderColorHover: '#777700',
  borderColorFocus: '#FFD700',
  textColor: '#FFFF00',
  placeholderColor: '#FFFF99',
  borderRadius: '6px',
  caretColor: '#FFD700',
}

const metalDarkButton: GlobalThemeOverrides['Button'] = {
  textColorText: '#8C8C96',
  textColorTextHover: '#E8E8EC',
  textColorTextPressed: '#5A5A66',
  textColorGhost: '#8C8C96',
  textColorGhostHover: '#E8E8EC',
  textColorGhostPressed: '#5A5A66',
  colorPrimary: '#5BA4F5',
  colorHoverPrimary: '#7BB8FF',
  colorPressedPrimary: '#4090E0',
  textColorPrimary: '#0A0A0B',
  borderRadiusMedium: '6px',
  borderRadiusSmall: '5px',
}

const warmLightButton: GlobalThemeOverrides['Button'] = {
  textColorText: '#8A7E6E',
  textColorTextHover: '#3A3228',
  textColorTextPressed: '#A89E90',
  textColorGhost: '#8A7E6E',
  textColorGhostHover: '#3A3228',
  textColorGhostPressed: '#A89E90',
  colorPrimary: '#C87A30',
  colorHoverPrimary: '#D99040',
  colorPressedPrimary: '#B06820',
  textColorPrimary: '#FFFFFF',
  borderRadiusMedium: '8px',
  borderRadiusSmall: '6px',
}

// 黑色主题按钮
const blackThemeButton: GlobalThemeOverrides['Button'] = {
  textColorText: '#AAAAAA',
  textColorTextHover: '#FFFFFF',
  textColorTextPressed: '#888888',
  textColorGhost: '#AAAAAA',
  textColorGhostHover: '#FFFFFF',
  textColorGhostPressed: '#888888',
  colorPrimary: '#FFFFFF',
  colorHoverPrimary: '#FFFFFF',
  colorPressedPrimary: '#FFFFFF',
  textColorPrimary: '#000000',
  borderRadiusMedium: '4px',
  borderRadiusSmall: '3px',
}

// 蓝色主题按钮
const blueThemeButton: GlobalThemeOverrides['Button'] = {
  textColorText: '#B0E0E6',
  textColorTextHover: '#FFFFFF',
  textColorTextPressed: '#87CEEB',
  textColorGhost: '#B0E0E6',
  textColorGhostHover: '#FFFFFF',
  textColorGhostPressed: '#87CEEB',
  colorPrimary: '#1E90FF',
  colorHoverPrimary: '#4682B4',
  colorPressedPrimary: '#191970',
  textColorPrimary: '#FFFFFF',
  borderRadiusMedium: '6px',
  borderRadiusSmall: '4px',
}

// 黄色主题按钮
const yellowThemeButton: GlobalThemeOverrides['Button'] = {
  textColorText: '#FFFF99',
  textColorTextHover: '#FFFF00',
  textColorTextPressed: '#FFFFCC',
  textColorGhost: '#FFFF99',
  textColorGhostHover: '#FFFF00',
  textColorGhostPressed: '#FFFFCC',
  colorPrimary: '#FFD700',
  colorHoverPrimary: '#FFA500',
  colorPressedPrimary: '#FF8C00',
  textColorPrimary: '#000000',
  borderRadiusMedium: '6px',
  borderRadiusSmall: '4px',
}

const metalDarkTag: GlobalThemeOverrides['Tag'] = {
  borderRadius: '4px',
}

const warmLightTag: GlobalThemeOverrides['Tag'] = {
  borderRadius: '6px',
}

// 黑色主题标签
const blackThemeTag: GlobalThemeOverrides['Tag'] = {
  borderRadius: '3px',
}

// 蓝色主题标签
const blueThemeTag: GlobalThemeOverrides['Tag'] = {
  borderRadius: '4px',
}

// 黄色主题标签
const yellowThemeTag: GlobalThemeOverrides['Tag'] = {
  borderRadius: '4px',
}

const metalDarkModal: GlobalThemeOverrides['Modal'] = {
  color: '#1A1A1E',
  borderColor: '#2A2A2E',
  textColor: '#E8E8EC',
  borderRadius: '8px',
}

const warmLightModal: GlobalThemeOverrides['Modal'] = {
  color: '#FFFCF7',
  borderColor: '#E8DFD2',
  textColor: '#2E261E',
  borderRadius: '12px',
}

// 黑色主题模态框
const blackThemeModal: GlobalThemeOverrides['Modal'] = {
  color: '#111111',
  borderColor: '#333333',
  textColor: '#FFFFFF',
  borderRadius: '6px',
}

// 蓝色主题模态框
const blueThemeModal: GlobalThemeOverrides['Modal'] = {
  color: '#002B5B',
  borderColor: '#004080',
  textColor: '#FFFFFF',
  borderRadius: '8px',
}

// 黄色主题模态框
const yellowThemeModal: GlobalThemeOverrides['Modal'] = {
  color: '#444400',
  borderColor: '#666600',
  textColor: '#FFFF00',
  borderRadius: '8px',
}

const metalDarkDivider: GlobalThemeOverrides['Divider'] = {
  color: '#222226',
}

const warmLightDivider: GlobalThemeOverrides['Divider'] = {
  color: '#EDE6DA',
}

// 黑色主题分隔线
const blackThemeDivider: GlobalThemeOverrides['Divider'] = {
  color: '#333333',
}

// 蓝色主题分隔线
const blueThemeDivider: GlobalThemeOverrides['Divider'] = {
  color: '#004080',
}

// 黄色主题分隔线
const yellowThemeDivider: GlobalThemeOverrides['Divider'] = {
  color: '#666600',
}

const metalDarkSwitch: GlobalThemeOverrides['Switch'] = {
  railColor: '#2A2A2E',
  railColorActive: '#5BA4F5',
}

const warmLightSwitch: GlobalThemeOverrides['Switch'] = {
  railColor: '#E8DFD2',
  railColorActive: '#C87A30',
}

// 黑色主题开关
const blackThemeSwitch: GlobalThemeOverrides['Switch'] = {
  railColor: '#333333',
  railColorActive: '#FFFFFF',
}

// 蓝色主题开关
const blueThemeSwitch: GlobalThemeOverrides['Switch'] = {
  railColor: '#004080',
  railColorActive: '#1E90FF',
}

// 黄色主题开关
const yellowThemeSwitch: GlobalThemeOverrides['Switch'] = {
  railColor: '#666600',
  railColorActive: '#FFD700',
}

const metalDarkDataTable: GlobalThemeOverrides['DataTable'] = {
  borderColor: '#222226',
  thColor: '#141416',
  thTextColor: '#8C8C96',
  tdColor: '#0A0A0B',
  tdTextColor: '#C0C0C8',
  thColorHover: '#1E1E22',
  tdColorHover: '#1E1E22',
}

const warmLightDataTable: GlobalThemeOverrides['DataTable'] = {
  borderColor: '#EDE6DA',
  thColor: '#FAF6F0',
  thTextColor: '#8A7E6E',
  tdColor: '#FFFCF7',
  tdTextColor: '#3A3228',
  thColorHover: '#FFF5EA',
  tdColorHover: '#FFF5EA',
}

// 黑色主题数据表格
const blackThemeDataTable: GlobalThemeOverrides['DataTable'] = {
  borderColor: '#333333',
  thColor: '#111111',
  thTextColor: '#AAAAAA',
  tdColor: '#000000',
  tdTextColor: '#FFFFFF',
  thColorHover: '#222222',
  tdColorHover: '#222222',
}

// 蓝色主题数据表格
const blueThemeDataTable: GlobalThemeOverrides['DataTable'] = {
  borderColor: '#004080',
  thColor: '#002B5B',
  thTextColor: '#B0E0E6',
  tdColor: '#001F3F',
  tdTextColor: '#FFFFFF',
  thColorHover: '#003366',
  tdColorHover: '#003366',
}

// 黄色主题数据表格
const yellowThemeDataTable: GlobalThemeOverrides['DataTable'] = {
  borderColor: '#666600',
  thColor: '#444400',
  thTextColor: '#FFFF99',
  tdColor: '#333300',
  tdTextColor: '#FFFF00',
  thColorHover: '#555500',
  tdColorHover: '#555500',
}

const metalDarkTree: GlobalThemeOverrides['Tree'] = {
  nodeTextColor: '#8C8C96',
  nodeTextColorHover: '#E8E8EC',
  nodeColorHover: '#1E1E22',
  lineHeight: '28px',
}

const warmLightTree: GlobalThemeOverrides['Tree'] = {
  nodeTextColor: '#8A7E6E',
  nodeTextColorHover: '#3A3228',
  nodeColorHover: '#FFF5EA',
  lineHeight: '30px',
}

// 黑色主题树形组件
const blackThemeTree: GlobalThemeOverrides['Tree'] = {
  nodeTextColor: '#AAAAAA',
  nodeTextColorHover: '#FFFFFF',
  nodeColorHover: '#222222',
  lineHeight: '26px',
}

// 蓝色主题树形组件
const blueThemeTree: GlobalThemeOverrides['Tree'] = {
  nodeTextColor: '#B0E0E6',
  nodeTextColorHover: '#FFFFFF',
  nodeColorHover: '#003366',
  lineHeight: '28px',
}

// 黄色主题树形组件
const yellowThemeTree: GlobalThemeOverrides['Tree'] = {
  nodeTextColor: '#FFFF99',
  nodeTextColorHover: '#FFFF00',
  nodeColorHover: '#555500',
  lineHeight: '28px',
}

export const useThemeStore = defineStore('theme', () => {
  const themeMode = ref<'light' | 'dark' | 'black' | 'blue' | 'yellow'>('dark')

  const theme = computed(() => {
    return themeMode.value === 'dark' ? darkTheme : null
  })

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    switch (themeMode.value) {
      case 'dark':
        return {
          common: metalDarkColors,
          Menu: metalDarkMenu,
          Card: metalDarkCard,
          Input: metalDarkInput,
          Button: metalDarkButton,
          Tag: metalDarkTag,
          Modal: metalDarkModal,
          Divider: metalDarkDivider,
          Switch: metalDarkSwitch,
          DataTable: metalDarkDataTable,
          Tree: metalDarkTree,
        }
      case 'black':
        return {
          common: blackThemeColors,
          Menu: blackThemeMenu,
          Card: blackThemeCard,
          Input: blackThemeInput,
          Button: blackThemeButton,
          Tag: blackThemeTag,
          Modal: blackThemeModal,
          Divider: blackThemeDivider,
          Switch: blackThemeSwitch,
          DataTable: blackThemeDataTable,
          Tree: blackThemeTree,
        }
      case 'blue':
        return {
          common: blueThemeColors,
          Menu: blueThemeMenu,
          Card: blueThemeCard,
          Input: blueThemeInput,
          Button: blueThemeButton,
          Tag: blueThemeTag,
          Modal: blueThemeModal,
          Divider: blueThemeDivider,
          Switch: blueThemeSwitch,
          DataTable: blueThemeDataTable,
          Tree: blueThemeTree,
        }
      case 'yellow':
        return {
          common: yellowThemeColors,
          Menu: yellowThemeMenu,
          Card: yellowThemeCard,
          Input: yellowThemeInput,
          Button: yellowThemeButton,
          Tag: yellowThemeTag,
          Modal: yellowThemeModal,
          Divider: yellowThemeDivider,
          Switch: yellowThemeSwitch,
          DataTable: yellowThemeDataTable,
          Tree: yellowThemeTree,
        }
      default: // light
        return {
          common: warmLightColors,
          Menu: warmLightMenu,
          Card: warmLightCard,
          Input: warmLightInput,
          Button: warmLightButton,
          Tag: warmLightTag,
          Modal: warmLightModal,
          Divider: warmLightDivider,
          Switch: warmLightSwitch,
          DataTable: warmLightDataTable,
          Tree: warmLightTree,
        }
    }
  })

  const isDark = computed(() => themeMode.value === 'dark' || themeMode.value === 'black')

  function toggleTheme() {
    const themes: Array<'light' | 'dark' | 'black' | 'blue' | 'yellow'> = ['light', 'dark', 'black', 'blue', 'yellow']
    const currentIndex = themes.indexOf(themeMode.value)
    const nextIndex = (currentIndex + 1) % themes.length
    themeMode.value = themes[nextIndex]
    saveTheme()
  }

  function setTheme(mode: 'light' | 'dark' | 'black' | 'blue' | 'yellow') {
    themeMode.value = mode
    saveTheme()
  }

  function saveTheme() {
    localStorage.setItem('theme-mode', themeMode.value)
  }

  function loadTheme() {
    const saved = localStorage.getItem('theme-mode') as 'light' | 'dark' | 'black' | 'blue' | 'yellow' | null
    if (saved) {
      themeMode.value = saved
    }
  }

  loadTheme()

  return {
    themeMode,
    theme,
    themeOverrides,
    isDark,
    toggleTheme,
    setTheme
  }
})
