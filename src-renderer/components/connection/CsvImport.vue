<script setup lang="ts">
import { ref, computed } from 'vue'
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
  useMessage,
  NAlert
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { CloudUploadOutline, AddOutline, RefreshOutline, WarningOutline } from '@vicons/ionicons5'
import { useConnectionStore } from '../../stores/useConnectionStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { AuthType } from '@shared/types'

interface CsvConnection {
  id: string
  name: string
  host: string
  port: number
  username: string
  authType: string
  password: string
  privateKeyPath: string
  passphrase: string
  description: string
  selected: boolean
  error?: string
}

const connectionStore = useConnectionStore()
const themeStore = useThemeStore()
const message = useMessage()
const isDark = computed(() => themeStore.isDark)

const csvContent = ref('')
const parsedConnections = ref<CsvConnection[]>([])
const checkedRowKeys = ref<string[]>([])
const loading = ref(false)
const showPreview = ref(false)
const previewContent = ref('')
const importErrors = ref<string[]>([])

function generateId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// CSV列定义
const columns: DataTableColumns<CsvConnection> = [
  {
    title: '连接名称',
    key: 'name',
    width: 150
  },
  {
    title: '主机地址',
    key: 'host',
    width: 180
  },
  {
    title: '端口',
    key: 'port',
    width: 80
  },
  {
    title: '用户名',
    key: 'username',
    width: 120
  },
  {
    title: '认证方式',
    key: 'authType',
    width: 120
  },
  {
    title: '密码',
    key: 'password',
    width: 100
  },
  {
    title: '私钥路径',
    key: 'privateKeyPath',
    width: 200
  },
  {
    title: '备注',
    key: 'description',
    width: 150
  }
]

function parseCsv(content: string): CsvConnection[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) {
    return []
  }

  const headers = lines[0].split(',').map(header => header.trim())
  
  // 验证必要字段
  const requiredFields = ['name', 'host', 'username']
  const missingFields = requiredFields.filter(field => !headers.includes(field))
  
  if (missingFields.length > 0) {
    throw new Error(`CSV文件缺少必要字段: ${missingFields.join(', ')}`)
  }

  const connections: CsvConnection[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim())
    const row: Record<string, string> = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    // 验证认证方式
    let authType = row['authType'] || 'password'
    if (!['password', 'publickey', 'agent'].includes(authType)) {
      authType = 'password'
    }
    
    connections.push({
      id: generateId(),
      name: row['name'] || '',
      host: row['host'] || '',
      port: parseInt(row['port']) || 22,
      username: row['username'] || '',
      authType,
      password: row['password'] || '',
      privateKeyPath: row['privateKeyPath'] || '',
      passphrase: row['passphrase'] || '',
      description: row['description'] || '',
      selected: false
    })
  }
  
  return connections
}

function handleParse(): void {
  if (!csvContent.value.trim()) {
    message.warning('请输入CSV内容')
    return
  }
  
  try {
    parsedConnections.value = parseCsv(csvContent.value)
    checkedRowKeys.value = parsedConnections.value.map(conn => conn.id)
    importErrors.value = []
  } catch (error: any) {
    message.error(error.message)
    importErrors.value = [error.message]
  }
}

function handleFileUpload(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    csvContent.value = e.target?.result as string
    handleParse()
  }
  reader.readAsText(file)
}

function toggleAll(checked: boolean): void {
  if (checked) {
    checkedRowKeys.value = parsedConnections.value.map(conn => conn.id)
  } else {
    checkedRowKeys.value = []
  }
}

async function handleImport(): Promise<void> {
  if (checkedRowKeys.value.length === 0) {
    message.warning('请至少选择一个连接')
    return
  }
  
  loading.value = true
  
  const connectionsToImport = parsedConnections.value
    .filter(conn => checkedRowKeys.value.includes(conn.id))
    .map(conn => ({
      name: conn.name,
      host: conn.host,
      port: conn.port,
      username: conn.username,
      authType: conn.authType as typeof AuthType[keyof typeof AuthType],
      password: conn.password || undefined,
      privateKeyPath: conn.privateKeyPath || undefined,
      passphrase: conn.passphrase || undefined,
      description: conn.description || undefined
    }))
  
  try {
    await connectionStore.addConnections(connectionsToImport)
    message.success(`成功导入 ${connectionsToImport.length} 个连接`)
    resetForm()
  } catch (error: any) {
    message.error(`导入失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

function resetForm(): void {
  csvContent.value = ''
  parsedConnections.value = []
  checkedRowKeys.value = []
  importErrors.value = []
}

function generatePreview(): void {
  const headers = ['name', 'host', 'port', 'username', 'authType', 'password', 'privateKeyPath', 'passphrase', 'description']
  const content = [headers.join(',')]
  
  parsedConnections.value.forEach(conn => {
    content.push([
      `"${conn.name}"`,
      `"${conn.host}"`,
      conn.port.toString(),
      `"${conn.username}"`,
      `"${conn.authType}"`,
      `"${conn.password}"`,
      `"${conn.privateKeyPath}"`,
      `"${conn.passphrase}"`,
      `"${conn.description}"`
    ].join(','))
  })
  
  previewContent.value = content.join('\n')
  showPreview.value = true
}
</script>

<template>
  <NSpin :show="loading">
    <NCard
      title="从 CSV 导入"
      :bordered="false"
      style="border-radius: 8px"
    >
      <template #header-extra>
        <NSpace>
          <NButton
            size="small"
            quaternary
            @click="resetForm"
          >
            <template #icon>
              <NIcon :component="RefreshOutline" />
            </template>
            清空
          </NButton>
        </NSpace>
      </template>

      <div class="import-section" :class="{ 'import-section--dark': isDark, 'import-section--light': !isDark }">
        <NText depth="3" style="font-size: 13px; margin-bottom: 12px; display: block">
          粘贴CSV内容，或上传CSV文件
        </NText>

        <NAlert
          v-if="importErrors.length > 0"
          type="error"
          size="small"
          style="margin-bottom: 12px"
        >
          <template #icon>
            <NIcon :component="WarningOutline" />
          </template>
          <div v-for="(error, index) in importErrors" :key="index">
            {{ error }}
          </div>
        </NAlert>

        <NInput
          v-model:value="csvContent"
          type="textarea"
          placeholder="name,host,port,username,authType,password,privateKeyPath,passphrase,description
example.com,192.168.1.100,22,admin,password,secret,,,
test-server,10.0.0.1,22,root,publickey,/path/to/key,,"
          :rows="8"
          style="margin-bottom: 12px"
        />

        <NSpace style="margin-bottom: 16px">
          <NButton
            type="primary"
            @click="handleParse"
          >
            <template #icon>
              <NIcon :component="CloudUploadOutline" />
            </template>
            解析
          </NButton>

          <label for="csv-file">
            <NButton tag="span" style="cursor: pointer">
              <template #icon>
                <NIcon :component="AddOutline" />
              </template>
              上传文件
            </NButton>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              style="display: none"
              @change="handleFileUpload"
            />
          </label>
        </NSpace>
      </div>

      <template v-if="parsedConnections.length > 0">
        <NDivider style="margin: 16px 0" />

        <div class="parsed-section" :class="{ 'parsed-section--dark': isDark, 'parsed-section--light': !isDark }">
          <div class="parsed-header">
            <NText strong style="font-size: 14px">
              解析结果 ({{ parsedConnections.length }} 个连接)
            </NText>
            <NCheckbox
              :checked="checkedRowKeys.length === parsedConnections.length && parsedConnections.length > 0"
              :indeterminate="checkedRowKeys.length > 0 && checkedRowKeys.length < parsedConnections.length"
              @update:checked="toggleAll"
            >
              全选
            </NCheckbox>
          </div>

          <NDataTable
            v-model:checked-row-keys="checkedRowKeys"
            :columns="columns"
            :data="parsedConnections"
            :row-key="(row: CsvConnection) => row.id"
            :pagination="false"
            :max-height="300"
            style="margin: 12px 0"
          />

          <NSpace style="margin-top: 16px">
            <NButton
              type="primary"
              @click="handleImport"
            >
              <template #icon>
                <NIcon :component="AddOutline" />
              </template>
              导入选中 ({{ checkedRowKeys.length }})
            </NButton>

            <NButton @click="generatePreview">
              预览生成CSV
            </NButton>
          </NSpace>
        </div>
      </template>

      <template v-else>
        <NEmpty
          v-if="!csvContent"
          description="请在上方粘贴 CSV 内容"
          style="margin-top: 40px"
        />
      </template>
    </NCard>

    <NModal
      v-model:show="showPreview"
      preset="card"
      title="生成的CSV预览"
      style="width: 600px"
    >
      <NInput
        v-model:value="previewContent"
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
            @click="navigator.clipboard.writeText(previewContent); message.success('已复制')"
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
  padding: 16px;
  border-radius: 8px;
}

.import-section--dark {
  background: #0E0E10;
  border: 1px solid #1E1E22;
}

.import-section--light {
  background: #FFFCF7;
  border: 1px solid #EDE6DA;
}

.parsed-section {
  padding: 16px;
  border-radius: 8px;
}

.parsed-section--dark {
  background: #0E0E10;
  border: 1px solid #1E1E22;
}

.parsed-section--light {
  background: #FFFCF7;
  border: 1px solid #EDE6DA;
}

.parsed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>