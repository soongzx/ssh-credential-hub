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
  NColorPicker,
  NText
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
  if (!formData.value.name.trim()) {
    return
  }
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
    <!-- 空状态 -->
    <div v-if="tagStore.tags.length === 0 && !tagStore.loading" class="empty-state">
      <NEmpty description="暂无标签">
        <template #extra>
          <NButton type="primary" @click="handleAdd">
            <template #icon>
              <NIcon :component="AddOutline" />
            </template>
            新建标签
          </NButton>
        </template>
      </NEmpty>
    </div>

    <!-- 标签列表 -->
    <div v-else class="tag-list">
      <NCard
        v-for="tag in tagStore.tags"
        :key="tag.id"
        size="small"
        class="tag-card"
        :body-style="{ padding: '16px' }"
      >
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <NTag
                :color="{ color: tag.color, textColor: '#fff' }"
                size="large"
                style="border-radius: 9999px; font-size: 14px"
              >
                {{ tag.name }}
              </NTag>
            </div>
            <NSpace>
              <NButton
                text
                size="small"
                style="color: rgba(38, 37, 30, 0.55); font-size: 13px"
                @click="handleEdit(tag)"
              >
                编辑
              </NButton>
              <NButton
                text
                size="small"
                style="color: #cf2d56; font-size: 13px"
                @click="handleDelete(tag.id)"
              >
                删除
              </NButton>
            </NSpace>
          </div>
        </template>
      </NCard>
    </div>

    <!-- 标签表单弹窗 -->
    <NModal
      :show="showForm"
      preset="card"
      :title="editingTag ? '编辑标签' : '新建标签'"
      style="width: 400px; background: #f2f1ed; border-radius: 8px"
      :mask-closable="false"
      @update:show="showForm = $event"
    >
      <NForm label-placement="left" label-width="60px">
        <NFormItem label="名称" required>
          <NInput
            v-model:value="formData.name"
            placeholder="标签名称"
            style="border-radius: 8px"
          />
        </NFormItem>

        <NFormItem label="颜色">
          <NColorPicker v-model:value="formData.color" style="width: 100%" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton style="border-radius: 8px" @click="handleClose">取消</NButton>
          <NButton
            type="primary"
            style="border-radius: 8px; background: #f54e00; border-color: #f54e00"
            @click="handleSubmit"
          >
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-card {
  background: #f2f1ed;
  border: 1px solid rgba(38, 37, 30, 0.1);
  border-radius: 8px;
  transition: box-shadow 200ms ease, border-color 200ms ease;
}

.tag-card:hover {
  border-color: rgba(38, 37, 30, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #f2f1ed;
  border: 1px solid rgba(38, 37, 30, 0.1);
  border-radius: 8px;
}
</style>
