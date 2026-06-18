<template>
  <UModal
    v-model:open="isModalOpen"
    title="編輯標籤"
    :content="{ onCloseAutoFocus: resetSelection }"
    scrollable
    :ui="{ content: 'w-full max-w-xl' }"
  >
    <template #body>
      <div class="text-sub mb-2 text-sm">請選擇要編輯的標籤</div>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="tag in props.tags"
          :key="tag.id"
          :label="tag.name"
          color="neutral"
          variant="outline"
          size="sm"
          leading-icon="i-material-symbols-tag"
          @click="startEditTag(tag)"
        />
      </div>

      <!-- 編輯區塊 -->
      <div v-if="selectedTag" class="mt-6 flex gap-3">
        <UInput v-model="editingTagName" placeholder="請輸入新名稱" :ui="{ base: 'pr-12' }">
          <template #trailing>
            <UButton
              color="error"
              variant="link"
              square
              icon="i-lucide-trash-2"
              @click="handleDelete(selectedTag)"
            />
          </template>
        </UInput>
        <UButton label="取消" color="neutral" variant="link" size="sm" @click="resetSelection" />
        <UButton
          label="確認"
          color="primary"
          variant="solid"
          size="sm"
          :disabled="!editingTagName.trim() || editingTagName.trim() === selectedTag.name"
          @click="updateTag"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { TagItem } from '#shared/types/work';

const props = withDefaults(
  defineProps<{
    tags?: TagItem[];
  }>(),
  {
    tags: () => [],
  },
);

const emit = defineEmits<{
  save: [];
}>();

const isModalOpen = defineModel<boolean>('open', { default: false });

const toast = useAppToast();

// =============== 編輯區塊 ===============
const selectedTag = ref<TagItem | null>(null);
const editingTagName = ref<string>('');

const startEditTag = (tag: TagItem) => {
  selectedTag.value = tag;
  editingTagName.value = tag.name;
};

const updateTag = async () => {
  if (!selectedTag.value) return;

  try {
    await $fetch('/api/admin/tags', {
      method: 'PUT',
      body: {
        id: selectedTag.value.id,
        name: editingTagName.value.trim(),
      },
    });
    emit('save');
    resetSelection();
    toast.success('標籤編輯成功');
  } catch (error) {
    toast.error(getErrorMessage(error, '標籤編輯失敗，請稍後再試'));
  }
};

const confirmDelete = useDeleteModal();

const handleDelete = async (tag: TagItem) => {
  const confirmed = await confirmDelete({
    itemTypeName: '標籤',
    itemTitle: tag.name,
  });

  if (!confirmed) return;

  try {
    await $fetch(`/api/admin/tags/${tag.id}`, {
      method: 'DELETE',
    });
    emit('save');
    resetSelection();
    toast.success('標籤刪除成功');
  } catch (error) {
    toast.error(getErrorMessage(error, '標籤刪除失敗，請稍後再試'));
  }
};

const resetSelection = () => {
  selectedTag.value = null;
  editingTagName.value = '';
};
</script>

<style scoped></style>
