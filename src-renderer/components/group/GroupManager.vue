<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import {
  NCard,
  NSpace,
  NButton,
  NTree,
  NEmpty,
  NSpin,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NText
} from 'naive-ui'
import type { TreeOption, SelectOption } from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline, FolderOutline } from '@vicons/ionicons5'
import { useGroupStore } from '../../stores/useGroupStore'
import type { Group } from '@shared/types'

const groupStore = useGroupStore()

const showForm = ref(false)
const editingGroup = ref<string | null>(null)

const formData = ref<{
  name: string
  parentId: string | null
}>({
  name: '',
  parentId: null
})

onMounted(() => {
  groupStore.fetchGroups()
})

// 构建树形数据
const treeData = computed(() => {
  function buildTree(parentId: string | null): TreeOption[] {
    const groups = parentId === null
      ? groupStore.rootGroups
      : groupStore.getChildren(parentId)

    return groups.map((group) => ({
      key: group.id,
      label: group.name,
      prefix: () => h(NIcon, { size: 18 }, { default: () => h(FolderOutline) }),
      children: buildTree(group.id)
    }))
  }

  return buildTree(null)
})

// 父分组选项（排除自身及子分组）
const parentOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [{ label: '无（顶层分组）', value: '' }]

  function addOptions(groups: Group[], prefix: string = '') {
    for (const group of groups) {
      if (group.id !== editingGroup.value) {
        options.push({
          label: prefix + group.name,
          value: group.id
        })
        addOptions(groupStore.getChildren(group.id), prefix + '  ')
      }
    }
  }

  addOptions(groupStore.rootGroups)
  return options
})

function handleAdd(): void {
  editingGroup.value = null
  formData.value = { name: '', parentId: null }
  showForm.value = true
}

function handleEdit(group: Group): void {
  editingGroup.value = group.id
  formData.value = {
    name: group.name,
    parentId: group.parentId ?? null
  }
  showForm.value = true
}

async function handleDelete(id: string): Promise<void> {
  await groupStore.removeGroup(id)
}

function handleClose(): void {
  showForm.value = false
  editingGroup.value = null
}

async function handleSubmit(): Promise<void> {
  if (!formData.value.name.trim()) {
    return
  }
  const data = {
    name: formData.value.name,
    parentId: formData.value.parentId || undefined
  }

  if (editingGroup.value) {
    await groupStore.updateGroup(editingGroup.value, data)
  } else {
    await groupStore.addGroup(data)
  }
  handleClose()
}

function renderSwitcherIcon({ expanded }: { expanded: boolean }) {
  return h(NIcon, { size: 18 }, { default: () => h(FolderOutline) })
}
</script>

<template>
  <div>
    <!-- 空状态 -->
    <div v-if="groupStore.groups.length === 0 && !groupStore.loading" class="empty-state">
      <NEmpty description="暂无分组">
        <template #extra>
          <NButton type="primary" @click="handleAdd">
            <template #icon>
              <NIcon :component="AddOutline" />
            </template>
            新建分组
          </NButton>
        </template>
      </NEmpty>
    </div>

    <!-- 分组列表 -->
    <div v-else class="group-list">
      <NCard size="small" :body-style="{ padding: '16px' }" style="background: #f2f1ed; border: 1px solid rgba(38, 37, 30, 0.1); border-radius: 8px">
        <NTree
          :data="treeData"
          :render-switcher-icon="renderSwitcherIcon"
          block-line
          default-expand-all
        >
          <template #default="{ option }">
            <div class="tree-item">
              <NText style="color: #26251e; font-size: 14px">{{ option.label }}</NText>
              <NSpace>
                <NButton
                  text
                  size="small"
                  style="color: rgba(38, 37, 30, 0.55); font-size: 13px"
                  @click.stop="handleEdit(groupStore.groups.find(g => g.id === option.key)!)"
                >
                  编辑
                </NButton>
                <NButton
                  text
                  size="small"
                  style="color: #cf2d56; font-size: 13px"
                  @click.stop="handleDelete(option.key as string)"
                >
                  删除
                </NButton>
              </NSpace>
            </div>
          </template>
        </NTree>
      </NCard>
    </div>

    <!-- 分组表单弹窗 -->
    <NModal
      :show="showForm"
      preset="card"
      :title="editingGroup ? '编辑分组' : '新建分组'"
      style="width: 400px; background: #f2f1ed; border-radius: 8px"
      :mask-closable="false"
      @update:show="showForm = $event"
    >
      <NForm label-placement="left" label-width="80px">
        <NFormItem label="名称" required>
          <NInput
            v-model:value="formData.name"
            placeholder="分组名称"
            style="border-radius: 8px"
          />
        </NFormItem>

        <NFormItem label="父分组">
          <NSelect
            v-model:value="formData.parentId"
            :options="parentOptions"
            placeholder="选择父分组（可选）"
            clearable
            style="border-radius: 8px"
          />
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
.group-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tree-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
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
