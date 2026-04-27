<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import {
  NModal,
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
  NDivider
} from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { useConnectionStore } from '../../stores/useConnectionStore'
import { useTagStore } from '../../stores/useTagStore'
import { AuthType } from '@shared/types'
import type { Connection, Tag } from '@shared/types'

interface Props {
  show: boolean
  connectionId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

const connectionStore = useConnectionStore()
const tagStore = useTagStore()

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

// 可用的标签选项
const tagOptions = computed(() =>
  tagStore.tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
    color: tag.color
  }))
)

onMounted(() => {
  tagStore.fetchTags()
})

// 编辑模式时加载数据
watch(
  () => props.connectionId,
  async (id) => {
    if (id) {
      const conn = connectionStore.getConnectionById(id)
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
        // 加载关联的标签
        connectionTags.value = await tagStore.fetchTagsByConnection(id)
        formData.value.selectedTagIds = connectionTags.value.map((t) => t.id)
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

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

function handleClose(): void {
  emit('update:show', false)
  emit('close')
  resetForm()
}

async function handleSubmit(): Promise<void> {
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
  } else {
    const newConn = await connectionStore.addConnection(data)
    connectionId = newConn.id
  }

  // 更新标签关联
  await syncTags(connectionId)

  handleClose()
}

async function syncTags(connectionId: string): Promise<void> {
  const currentTagIds = connectionTags.value.map((t) => t.id)
  const newTagIds = formData.value.selectedTagIds

  // 移除不再关联的标签
  for (const tagId of currentTagIds) {
    if (!newTagIds.includes(tagId)) {
      await tagStore.unassignTagFromConnection(connectionId, tagId)
    }
  }

  // 添加新关联的标签
  for (const tagId of newTagIds) {
    if (!currentTagIds.includes(tagId)) {
      await tagStore.assignTagToConnection(connectionId, tagId)
    }
  }
}

function handleCancel(): void {
  handleClose()
}

function getTagColor(tagId: string): string {
  const tag = tagStore.tags.find((t) => t.id === tagId)
  return tag?.color ?? '#1890ff'
}

function getTagName(tagId: string): string {
  const tag = tagStore.tags.find((t) => t.id === tagId)
  return tag?.name ?? tagId
}
</script>

<template>
  <NModal
    :show="props.show"
    :title="isEdit ? '编辑连接' : '新建连接'"
    preset="card"
    style="width: 520px"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
  >
    <NForm label-placement="left" label-width="80px">
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
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleCancel">取消</NButton>
        <NButton type="primary" @click="handleSubmit">保存</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
