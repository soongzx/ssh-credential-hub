<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard,
  NSpace,
  NButton,
  NText,
  NInput,
  NCheckbox,
  NDataTable,
  NEmpty,
  NSpin,
  NModal,
  NDivider,
  NIcon,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { CloudUploadOutline, AddOutline, RefreshOutline } from '@vicons/ionicons5'
import { useConnectionStore } from '../../stores/useConnectionStore'

interface ParsedHost {
  id: string
  name: string
  host: string
  port: number
  username: string
  identityFile: string
  selected: boolean
}

const connectionStore = useConnectionStore()
const message = useMessage()

const sshConfigText = ref('')
const parsedHosts = ref<ParsedHost[]>([])
const checkedRowKeys = ref<string[]>([])
const loading = ref(false)
const showPreview = ref(false)
const previewConfig = ref('')

function generateId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function parseSshConfig(text: string): ParsedHost[] {
  const hosts: ParsedHost[] = []
  const lines = text.split('\n')
  let currentHost: Partial<ParsedHost> | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const hostMatch = trimmed.match(/^Host\s+(.+)$/i)
    if (hostMatch) {
      if (currentHost && currentHost.name) {
        hosts.push({
          id: generateId(),
          name: currentHost.name,
          host: currentHost.host || currentHost.name,
          port: currentHost.port || 22,
          username: currentHost.username || '',
          identityFile: currentHost.identityFile || '',
          selected: true
        })
      }
      currentHost = { name: hostMatch[1].trim() }
      continue
    }

    if (currentHost) {
      const userMatch = trimmed.match(/^User\s+(.+)$/i)
      if (userMatch) {
        currentHost.username = userMatch[1].trim()
        continue
      }

      const hostNameMatch = trimmed.match(/^HostName\s+(.+)$/i)
      if (hostNameMatch) {
        currentHost.host = hostNameMatch[1].trim()
        continue
      }

      const portMatch = trimmed.match(/^Port\s+(\d+)$/i)
      if (portMatch) {
        currentHost.port = parseInt(portMatch[1], 10)
        continue
      }

      const identityMatch = trimmed.match(/^IdentityFile\s+(.+)$/i)
      if (identityMatch) {
        currentHost.identityFile = identityMatch[1].trim().replace(/^~/, process.env.HOME || '/root')
        continue
      }
    }
  }

  if (currentHost && currentHost.name) {
    hosts.push({
      id: generateId(),
      name: currentHost.name,
      host: currentHost.host || currentHost.name,
      port: currentHost.port || 22,
      username: currentHost.username || '',
      identityFile: currentHost.identityFile || '',
      selected: true
    })
  }

  return hosts
}

function handleParse(): void {
  if (!sshConfigText.value.trim()) {
    message.warning('请输入 SSH Config 内容')
    return
  }

  loading.value = true
  try {
    parsedHosts.value = parseSshConfig(sshConfigText.value)
    checkedRowKeys.value = parsedHosts.value.map(h => h.id)
    if (parsedHosts.value.length === 0) {
      message.info('未解析到有效的 Host 配置')
    } else {
      message.success(`成功解析 ${parsedHosts.value.length} 个 Host`)
    }
  } catch (error) {
    message.error('解析失败')
  } finally {
    loading.value = false
  }
}

function handleFileUpload(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    sshConfigText.value = e.target?.result as string
    message.success('文件读取成功，点击解析')
  }
  reader.onerror = () => {
    message.error('文件读取失败')
  }
  reader.readAsText(file)
}

function toggleAll(selected: boolean): void {
  if (selected) {
    checkedRowKeys.value = parsedHosts.value.map(h => h.id)
  } else {
    checkedRowKeys.value = []
  }
}

async function handleImport(): Promise<void> {
  const selectedHosts = parsedHosts.value.filter(h => checkedRowKeys.value.includes(h.id))
  if (selectedHosts.length === 0) {
    message.warning('请选择要导入的 Host')
    return
  }

  loading.value = true
  let successCount = 0
  let failCount = 0

  for (const host of selectedHosts) {
    try {
      const authType = host.identityFile ? 'publickey' : 'password'
      await connectionStore.addConnection({
        name: host.name,
        host: host.host,
        port: host.port,
        username: host.username,
        authType,
        privateKeyPath: host.identityFile || undefined
      })
      successCount++
    } catch {
      failCount++
    }
  }

  loading.value = false

  if (failCount === 0) {
    message.success(`成功导入 ${successCount} 个连接`)
    parsedHosts.value = []
    checkedRowKeys.value = []
    sshConfigText.value = ''
  } else {
    message.warning(`导入完成：成功 ${successCount}，失败 ${failCount}`)
  }

  await connectionStore.fetchConnections()
}

function generatePreviewConfig(): void {
  const selectedHosts = parsedHosts.value.filter(h => checkedRowKeys.value.includes(h.id))
  let config = ''

  for (const host of selectedHosts) {
    config += `Host ${host.name}\n`
    config += `    HostName ${host.host}\n`
    if (host.username) {
      config += `    User ${host.username}\n`
    }
    if (host.port !== 22) {
      config += `    Port ${host.port}\n`
    }
    if (host.identityFile) {
      config += `    IdentityFile ${host.identityFile}\n`
    }
    config += '\n'
  }

  previewConfig.value = config.trim()
  showPreview.value = true
}

const columns: DataTableColumns<ParsedHost> = [
  {
    type: 'selection',
    width: 50
  },
  {
    title: 'Host 别名',
    key: 'name',
    width: 150
  },
  {
    title: '主机名/IP',
    key: 'host',
    width: 180
  },
  {
    title: '端口',
    key: 'port',
    width: 80
  },
  {
    title: '用户',
    key: 'username',
    width: 120
  },
  {
    title: '密钥文件',
    key: 'identityFile',
    ellipsis: { tooltip: true }
  }
]
</script>

<template>
  <NSpin :show="loading">
    <NCard
      title="从 SSH Config 导入"
      :bordered="false"
      style="background: #f2f1ed; border-radius: 8px"
    >
      <template #header-extra>
        <NSpace>
          <NButton
            size="small"
            quaternary
            @click="sshConfigText = ''; parsedHosts = []"
          >
            <template #icon>
              <NIcon :component="RefreshOutline" />
            </template>
            清空
          </NButton>
        </NSpace>
      </template>

      <div class="import-section">
        <NText depth="3" style="font-size: 13px; margin-bottom: 12px; display: block">
          粘贴 SSH Config 内容，或上传本地配置文件
        </NText>

        <NInput
          v-model:value="sshConfigText"
          type="textarea"
          placeholder="Host example.com
    HostName example.com
    User admin
    Port 22
    IdentityFile ~/.ssh/id_rsa"
          :rows="8"
          style="margin-bottom: 12px"
        />

        <NSpace style="margin-bottom: 16px">
          <NButton
            type="primary"
            style="background: #f54e00; border-color: #f54e00"
            @click="handleParse"
          >
            <template #icon>
              <NIcon :component="CloudUploadOutline" />
            </template>
            解析
          </NButton>

          <label for="ssh-config-file">
            <NButton tag="span" style="cursor: pointer">
              <template #icon>
                <NIcon :component="AddOutline" />
              </template>
              上传文件
            </NButton>
            <input
              id="ssh-config-file"
              type="file"
              accept=".config,.ssh,conf,*"
              style="display: none"
              @change="handleFileUpload"
            />
          </label>
        </NSpace>
      </div>

      <template v-if="parsedHosts.length > 0">
        <NDivider style="margin: 16px 0" />

        <div class="parsed-section">
          <div class="parsed-header">
            <NText strong style="font-size: 14px">
              解析结果 ({{ parsedHosts.length }} 个 Host)
            </NText>
            <NCheckbox
              :checked="checkedRowKeys.length === parsedHosts.length && parsedHosts.length > 0"
              :indeterminate="checkedRowKeys.length > 0 && checkedRowKeys.length < parsedHosts.length"
              @update:checked="toggleAll"
            >
              全选
            </NCheckbox>
          </div>

          <NDataTable
            v-model:checked-row-keys="checkedRowKeys"
            :columns="columns"
            :data="parsedHosts"
            :row-key="(row: ParsedHost) => row.id"
            :pagination="false"
            :max-height="300"
            style="margin: 12px 0"
          />

          <NSpace style="margin-top: 16px">
            <NButton
              type="primary"
              style="background: #f54e00; border-color: #f54e00"
              @click="handleImport"
            >
              <template #icon>
                <NIcon :component="AddOutline" />
              </template>
              导入选中 ({{ checkedRowKeys.length }})
            </NButton>

            <NButton @click="generatePreviewConfig">
              预览生成配置
            </NButton>
          </NSpace>
        </div>
      </template>

      <template v-else>
        <NEmpty
          v-if="!sshConfigText"
          description="请在上方粘贴 SSH Config 内容"
          style="margin-top: 40px"
        />
      </template>
    </NCard>

    <NModal
      v-model:show="showPreview"
      preset="card"
      title="生成的 SSH Config 预览"
      style="width: 600px"
    >
      <NInput
        v-model:value="previewConfig"
        type="textarea"
        :rows="12"
        readonly
        style="font-family: monospace"
      />
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showPreview = false">关闭</NButton>
          <NButton
            type="primary"
            style="background: #f54e00; border-color: #f54e00"
            @click="navigator.clipboard.writeText(previewConfig); message.success('已复制')"
          >
            复制到剪贴板
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </NSpin>
</template>

<style scoped>
.import-section {
  background: rgba(38, 37, 30, 0.02);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(38, 37, 30, 0.1);
}

.parsed-section {
  background: rgba(38, 37, 30, 0.02);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(38, 37, 30, 0.1);
}

.parsed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
