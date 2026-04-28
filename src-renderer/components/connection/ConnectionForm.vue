<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NButton,
  NRadioGroup,
  NRadioButton,
  NTag,
  NDivider,
  NText,
  NIcon,
  useMessage
} from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { useConnectionStore } from '../../stores/useConnectionStore'
import { useTagStore } from '../../stores/useTagStore'
import { AuthType } from '@shared/types'
import type { Tag } from '@shared/types'

interface Props {
  connectionId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const connectionStore = useConnectionStore()
const tagStore = useTagStore()
const message = useMessage()

const isEdit = computed(() => !!props.connectionId)

const formData = ref<{
  name: string
  host: string
  port: number
  username: string
  authType: string
  password: string
  privateKeyPath: string
  passphrase: string
  description: string
  selectedTagIds: string[]
}>({
  name: '',
  host: '',
  port: 22,
  username: '',
  authType: AuthType.PASSWORD,
  password: '',
  privateKeyPath: '',
  passphrase: '',
  description: '',
  selectedTagIds: []
})

const connectionTags = ref<Tag[]>([])

const authTypeOptions: SelectOption[] = [
  { label: '密码', value: AuthType.PASSWORD },
  { label: '密钥', value: AuthType.PUBLIC_KEY },
  { label: 'SSH Agent', value: AuthType.AGENT }
]

const showPassword = computed(() => formData.value.authType === AuthType.PASSWORD)
const showKey = computed(() => formData.value.authType === AuthType.PUBLIC_KEY)

const tagOptions = computed(() =>
  tagStore.tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
    color: tag.color
  }))
)

async function loadData(): Promise<void> {
  await tagStore.fetchTags()

  if (props.connectionId) {
    const conn = connectionStore.getConnectionById(props.connectionId)
    if (conn) {
      formData.value = {
        name: conn.name,
        host: conn.host,
        port: conn.port,
        username: conn.username,
        authType: conn.authType,
        password: conn.password ?? '',
        privateKeyPath: conn.privateKeyPath ?? '',
        passphrase: conn.passphrase ?? '',
        description: conn.description ?? '',
        selectedTagIds: []
      }
      connectionTags.value = await tagStore.fetchTagsByConnection(props.connectionId)
      formData.value.selectedTagIds = connectionTags.value.map((t) => t.id)
    }
  }
}

loadData()

function resetForm(): void {
  formData.value = {
    name: '',
    host: '',
    port: 22,
    username: '',
    authType: AuthType.PASSWORD,
    password: '',
    privateKeyPath: '',
    passphrase: '',
    description: '',
    selectedTagIds: []
  }
  connectionTags.value = []
}

async function handleSubmit(): Promise<void> {
  if (!formData.value.name.trim()) {
    message.warning('请输入连接名称')
    return
  }
  if (!formData.value.host.trim()) {
    message.warning('请输入主机地址')
    return
  }
  if (!formData.value.username.trim()) {
    message.warning('请输入用户名')
    return
  }

  const data = {
    name: formData.value.name,
    host: formData.value.host,
    port: formData.value.port,
    username: formData.value.username,
    authType: formData.value.authType as typeof AuthType[keyof typeof AuthType],
    password: formData.value.password || undefined,
    privateKeyPath: formData.value.privateKeyPath || undefined,
    passphrase: formData.value.passphrase || undefined,
    description: formData.value.description || undefined
  }

  let connectionId: string

  if (isEdit.value && props.connectionId) {
    await connectionStore.updateConnection(props.connectionId, data)
    connectionId = props.connectionId
    message.success('连接已更新')
  } else {
    const newConn = await connectionStore.addConnection(data)
    connectionId = newConn.id
    message.success('连接已创建')
  }

  await syncTags(connectionId)

  emit('back')
}

async function syncTags(connectionId: string): Promise<void> {
  const currentTagIds = connectionTags.value.map((t) => t.id)
  const newTagIds = formData.value.selectedTagIds

  for (const tagId of currentTagIds) {
    if (!newTagIds.includes(tagId)) {
      await tagStore.unassignTagFromConnection(connectionId, tagId)
    }
  }

  for (const tagId of newTagIds) {
    if (!currentTagIds.includes(tagId)) {
      await tagStore.assignTagToConnection(connectionId, tagId)
    }
  }
}

function handleBack(): void {
  emit('back')
}
</script>

<template>
  <div class="connection-form-page">
    <div class="page-header">
      <div class="header-back" @click="handleBack">
        <NButton quaternary style="padding: 8px">
          <template #icon>
            <NIcon :component="ArrowBackOutline" />
          </template>
          返回
        </NButton>
      </div>
      <NText strong style="font-size: 16px">
        {{ isEdit ? '编辑连接' : '新建连接' }}
      </NText>
    </div>

    <NCard
      :bordered="false"
      style="background: #f2f1ed; border-radius: 8px; margin-top: 16px"
    >
      <NForm label-placement="left" label-width="100px">
        <NFormItem label="名称" required>
          <NInput v-model:value="formData.name" placeholder="连接名称" />
        </NFormItem>

        <NFormItem label="主机" required>
          <NInput v-model:value="formData.host" placeholder="IP 或域名" />
        </NFormItem>

        <NFormItem label="端口">
          <NInputNumber v-model:value="formData.port" :min="1" :max="65535" style="width: 100%" />
        </NFormItem>

        <NFormItem label="用户名" required>
          <NInput v-model:value="formData.username" placeholder="SSH 用户名" />
        </NFormItem>

        <NFormItem label="认证方式">
          <NRadioGroup v-model:value="formData.authType">
            <NRadioButton
              v-for="option in authTypeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </NRadioButton>
          </NRadioGroup>
        </NFormItem>

        <NFormItem v-if="showPassword" label="密码">
          <NInput
            v-model:value="formData.password"
            type="password"
            placeholder="SSH 密码"
            show-password-on="mousedown"
          />
        </NFormItem>

        <NFormItem v-if="showKey" label="私钥路径">
          <NInput v-model:value="formData.privateKeyPath" placeholder="私钥文件路径" />
        </NFormItem>

        <NFormItem v-if="showKey" label="私钥口令">
          <NInput
            v-model:value="formData.passphrase"
            type="password"
            placeholder="私钥口令（可选）"
            show-password-on="mousedown"
          />
        </NFormItem>

        <NDivider />

        <NFormItem label="标签">
          <NSelect
            v-model:value="formData.selectedTagIds"
            :options="tagOptions"
            placeholder="选择标签"
            multiple
            clearable
            style="width: 100%"
          >
            <template #tag="{ option }">
              <NTag
                :color="{ color: option.color, textColor: '#fff' }"
                size="small"
              >
                {{ option.label }}
              </NTag>
            </template>
          </NSelect>
        </NFormItem>

        <NFormItem label="备注">
          <NInput
            v-model:value="formData.description"
            type="textarea"
            placeholder="功能备注"
            :rows="2"
          />
        </NFormItem>

        <NSpace justify="end" style="margin-top: 24px">
          <NButton @click="handleBack">取消</NButton>
          <NButton
            type="primary"
            style="background: #f54e00; border-color: #f54e00"
            @click="handleSubmit"
          >
            {{ isEdit ? '保存修改' : '创建连接' }}
          </NButton>
        </NSpace>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped>
.connection-form-page {
  max-width: 600px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-back {
  cursor: pointer;
}
</style>
