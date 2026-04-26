import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openTabbySSH: (host: string, port: number, user: string) => {
    ipcRenderer.send('open-tabby-ssh', { host, port, user })
  },
  platform: process.platform
})