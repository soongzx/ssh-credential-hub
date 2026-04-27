<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
      prefix: () => h(NIcon, null, { default: () => h(FolderOutline) }),
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
  return h(NIcon, null, {
    default: () => h(FolderOutline)
  })
}
</script>

<template>
  <div>
    <NSpace justify="space-between" style="margin-bottom: 16px">
      <NButton type="primary" @click="handleAdd">
        <template #icon>
          <NIcon :component="AddOutline" />
        </template>
        新建分组
      </NButton>
    </NSpace>

    <NSpin :show="groupStore.loading">
      <NCard v-if="groupStore.groups.length > 0" size="small">
        <NTree
          :data="treeData"
          :render-switcher-icon="renderSwitcherIcon"
          block-line
          default-expand-all
        >
          <template #default="{ option }">
            <NSpace align="center" justify="space-between" style="width: 100%">
              <NText>{{ option.label }}</NText>
              <NSpace>
                <NButton
                  text
                  size="small"
                  @click.stop="handleEdit(groupStore.groups.find(g => g.id === option.key)!)"
                >
                  <template #icon>
                    <NIcon :component="CreateOutline" />
                  </template>
                  编辑
                </NButton>
                <NButton
                  text
                  size="small"
                  type="error"
                  @click.stop="handleDelete(option.key as string)"
                >
                  <template #icon>
                    <NIcon :component="TrashOutline" />
                  </template>
                  删除
                </NButton>
              </NSpace>
            </NSpace>
          </template>
        </NTree>
      </NCard>

      <NEmpty v-else description="暂无分组" />
    </NSpin>

    <!-- 分组表单弹窗 -->
    <NModal
      :show="showForm"
      :title="editingGroup ? '编辑分组' : '新建分组'"
      preset="card"
      style="width: 400px"
      :mask-closable="false"
      @update:show="showForm = $event"
    >
      <NForm label-placement="left" label-width="80px">
        <NFormItem label="名称" required>
          <NInput v-model:value="formData.name" placeholder="分组名称" />
        </NFormItem>

        <NFormItem label="父分组">
          <NSelect
            v-model:value="formData.parentId"
            :options="parentOptions"
            placeholder="选择父分组（可选）"
            clearable
          />
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
