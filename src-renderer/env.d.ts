/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  electronAPI: {
    platform: string

    // 连接管理
    createConnection: (input: unknown) => Promise<unknown>
    getConnectionById: (id: string) => Promise<unknown>
    getAllConnections: () => Promise<unknown>
    searchConnections: (keyword: string) => Promise<unknown>
    updateConnection: (id: string, input: unknown) => Promise<unknown>
    deleteConnection: (id: string) => Promise<unknown>

    // 标签管理
    createTag: (input: unknown) => Promise<unknown>
    getTagById: (id: string) => Promise<unknown>
    getAllTags: () => Promise<unknown>
    updateTag: (id: string, input: unknown) => Promise<unknown>
    deleteTag: (id: string) => Promise<unknown>
    addTagToConnection: (connectionId: string, tagId: string) => Promise<unknown>
    removeTagFromConnection: (connectionId: string, tagId: string) => Promise<unknown>
    getTagsByConnectionId: (connectionId: string) => Promise<unknown>

    // 分组管理
    createGroup: (input: unknown) => Promise<unknown>
    getGroupById: (id: string) => Promise<unknown>
    getAllGroups: () => Promise<unknown>
    getRootGroups: () => Promise<unknown>
    getChildGroups: (parentId: string) => Promise<unknown>
    updateGroup: (id: string, input: unknown) => Promise<unknown>
    deleteGroup: (id: string) => Promise<unknown>

    // 终端配置
    createTerminalConfig: (input: unknown) => Promise<unknown>
    getTerminalConfigById: (id: string) => Promise<unknown>
    getAllTerminalConfigs: () => Promise<unknown>
    getDefaultTerminalConfig: () => Promise<unknown>
    updateTerminalConfig: (id: string, input: unknown) => Promise<unknown>
    deleteTerminalConfig: (id: string) => Promise<unknown>
  }
}
