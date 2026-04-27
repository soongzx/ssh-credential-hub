<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NButton,
  NTag,
  NEmpty,
  NSpin,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NColorPicker
} from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline, PricetagOutline } from '@vicons/ionicons5'
import { useTagStore } from '../../stores/useTagStore'

const tagStore = useTagStore()

const showForm = ref(false)
const editingTag = ref<string | null>(null)

const formData = ref({
  name: '',
  color: '#1890ff'
})

onMounted(() => {
  tagStore.fetchTags()
})

function handleAdd(): void {
  editingTag.value = null
  formData.value = { name: '', color: '#1890ff' }
  showForm.value = true
}

function handleEdit(tag: { id: string; name: string; color: string }): void {
  editingTag.value = tag.id
  formData.value = { name: tag.name, color: tag.color }
  showForm.value = true
}

async function handleDelete(id: string): Promise<void> {
  await tagStore.removeTag(id)
}

function handleClose(): void {
  showForm.value = false
  editingTag.value = null
}

async function handleSubmit(): Promise<void> {
  if (editingTag.value) {
    await tagStore.updateTag(editingTag.value, formData.value)
  } else {
    await tagStore.addTag(formData.value)
  }
  handleClose()
}
</script>

<template>
  <div>
    <NSpace justify="space-between" style="margin-bottom: 16px">
      <NButton type="primary" @click="handleAdd">
        <template #icon>
          <NIcon :component="AddOutline" />
        </template>
        新建标签
      </NButton>
    </NSpace>

    <NSpin :show="tagStore.loading">
      <NSpace v-if="tagStore.tags.length > 0" vertical>
        <NCard
          v-for="tag in tagStore.tags"
          :key="tag.id"
          size="small"
          hoverable
          class="tag-card"
        >
          <template #header>
            <NSpace align="center" justify="space-between">
              <NSpace align="center">
                <NIcon size="18" :component="PricetagOutline" />
                <NTag :color="{ color: tag.color, textColor: '#fff' }" size="large">
                  {{ tag.name }}
                </NTag>
              </NSpace>
              <NSpace>
                <NButton text size="small" @click="handleEdit(tag)">
                  <template #icon>
                    <NIcon :component="CreateOutline" />
                  </template>
                  编辑
                </NButton>
                <NButton text size="small" type="error" @click="handleDelete(tag.id)">
                  <template #icon>
                    <NIcon :component="TrashOutline" />
                  </template>
                  删除
                </NButton>
              </NSpace>
            </NSpace>
          </template>
        </NCard>
      </NSpace>

      <NEmpty v-else description="暂无标签" />
    </NSpin>

    <!-- 标签表单弹窗 -->
    <NModal
      :show="showForm"
      :title="editingTag ? '编辑标签' : '新建标签'"
      preset="card"
      style="width: 400px"
      :mask-closable="false"
      @update:show="showForm = $event"
    >
      <NForm label-placement="left" label-width="60px">
        <NFormItem label="名称" required>
          <NInput v-model:value="formData.name" placeholder="标签名称" />
        </NFormItem>

        <NFormItem label="颜色">
          <NColorPicker v-model:value="formData.color" style="width: 100%" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">取消</NButton>
          <NButton type="primary" @click="handleSubmit">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.tag-card {
  margin-bottom: 8px;
}

.tag-card:last-child {
  margin-bottom: 0;
}
</style>
