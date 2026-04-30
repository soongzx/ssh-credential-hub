<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
import { useThemeStore } from '../../stores/useThemeStore'

const tagStore = useTagStore()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

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
        :class="{ 'tag-card--dark': isDark, 'tag-card--light': !isDark }"
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
                class="btn-edit"
                @click="handleEdit(tag)"
              >
                编辑
              </NButton>
              <NButton
                text
                size="small"
                class="btn-delete"
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
      style="width: 400px; border-radius: 10px"
      :mask-closable="false"
      @update:show="showForm = $event"
    >
      <NForm label-placement="left" label-width="60px">
        <NFormItem label="名称" required>
          <NInput
            v-model:value="formData.name"
            placeholder="标签名称"
          />
        </NFormItem>

        <NFormItem label="颜色">
          <NColorPicker v-model:value="formData.color" style="width: 100%" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">取消</NButton>
          <NButton
            type="primary"
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

.tag-card--dark {
  border: 1px solid #2A2A2E;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.tag-card--dark:hover {
  border-color: #3A3A42;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.tag-card--light {
  border: 1px solid #E8DFD2;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.tag-card--light:hover {
  border-color: #D4C8B8;
  box-shadow: 0 4px 12px rgba(58, 50, 40, 0.1);
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

.btn-edit, .btn-delete {
  font-size: 13px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border-radius: 10px;
}

.empty-state--dark {
  background: #0E0E10;
  border: 1px solid #1E1E22;
}

.empty-state--light {
  background: #FFFCF7;
  border: 1px solid #EDE6DA;
}
</style>
