<template>
  <div class="flex grow flex-col space-y-5">
    <!-- 頂部操作列 -->
    <div class="flex items-center justify-between">
      <USelect v-model="currentCategory" :items="categorySelectItems" class="w-36" />

      <UButton
        label="新增作品"
        color="primary"
        variant="solid"
        size="md"
        icon="i-lucide-plus"
        :ui="{ label: 'hidden sm:block' }"
        @click="openWorkModal('add')"
      />
    </div>

    <!-- 資料表格 -->
    <div class="grow">
      <UTable
        :data="shouldShowSkeleton ? skeletonData : (workData?.works ?? [])"
        :columns="columns"
        sticky
        :empty="'沒有資料'"
        :ui="{
          thead: 'after:hidden',
          tr: `${shouldShowSkeleton ? 'hover:bg-transparent!' : ''}`,
        }"
      >
        <!-- 標題 -->
        <template #title-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-36" />
          <span v-else>{{ row.original.title }}</span>
        </template>

        <!-- 分類 -->
        <template #category-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-16" />
          <span v-else>{{ categoryLabels[row.original.category] || row.original.category }}</span>
        </template>

        <!-- 標籤 -->
        <template #tags-header="{ column }">
          <div class="flex items-center gap-2">
            <span>{{ column.columnDef.header }}</span>
            <UButton
              title="編輯標籤"
              variant="link"
              size="sm"
              icon="i-uil-setting"
              class="-m-1.5 -mt-2"
              @click="
                () => {
                  isTagEditorOpen = true;
                }
              "
            />
          </div>
        </template>

        <template #tags-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-36" />
          <span v-else>{{ row.original.tags?.map((tag) => tag.name).join('、') || '' }}</span>
        </template>

        <!-- 公開狀態 -->
        <template #isPublic-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-5 w-9 rounded-full" />
          <USwitch v-else :model-value="row.original.isPublic" color="primary" disabled />
        </template>

        <!-- 更新時間 -->
        <template #updatedAt-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-36" />
          <span v-else>
            {{ new Date(row.original.updatedAt).toLocaleString('zh-TW', { hour12: false }) }}
          </span>
        </template>

        <!-- 操作 -->
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-3">
            <template v-if="shouldShowSkeleton">
              <USkeleton class="h-9 w-9" />
              <USkeleton class="h-9 w-9" />
            </template>

            <template v-else>
              <UButton
                color="neutral"
                variant="link"
                icon="i-lucide-pencil"
                class="text-ink hover:text-ink/75 p-2"
                @click="openWorkModal('edit', row.original)"
              />
              <UButton
                color="error"
                variant="link"
                icon="i-lucide-trash-2"
                class="p-2"
                @click="handleWorkDelete(row.original)"
              />
            </template>
          </div>
        </template>
      </UTable>
    </div>

    <!-- 分頁 -->
    <UPagination
      v-model:page="currentPage"
      :items-per-page="PAGE_SIZE"
      :total="totalWorkCount"
      class="flex justify-center"
    />

    <!-- 其他元件 -->
    <AdminWorkModal
      v-model:open="isWorkModalOpen"
      :mode="workModalMode"
      :data="tempWorkData"
      :tag-menu="tagMenu"
      @save="handleWorkModalSave"
    />

    <AdminTagEditor v-model:open="isTagEditorOpen" :tags="tags" @save="handleTagEditorSave" />
  </div>
</template>

<script lang="ts" setup>
import { categoryLabels, categoryOptions } from '#shared/constants/work';
import type { SelectItem, TableColumn } from '@nuxt/ui';

type WorkModalMode = 'add' | 'edit';

const toast = useAppToast();

const categorySelectItems = ref<SelectItem[]>([
  { label: '全部分類', value: 'all' },
  ...categoryOptions,
]);

// =============== 取得資料 ===============
// 作品
const currentPage = ref(1);
const PAGE_SIZE = 10;
const currentCategory = ref('all');

const {
  data: workData,
  pending: isWorkDataLoading,
  error: workError,
  refresh: refreshWorkData,
} = await useFetch('/api/admin/works', {
  query: {
    page: currentPage,
    page_size: PAGE_SIZE,
    category: currentCategory,
  },
  watch: false,
});

const totalWorkCount = computed(() => (workData.value?.pagination.totalPages ?? 0) * PAGE_SIZE);

watch(currentPage, () => {
  refreshWorkData();
});

watch(currentCategory, () => {
  if (currentPage.value !== 1) currentPage.value = 1;
  refreshWorkData();
});

const refreshWorkOrGoPrevPage = () => {
  const { works, pagination } = workData.value ?? {};
  const totalPages = pagination?.totalPages ?? 0;
  const shouldBackToPrevPage = works?.length === 1 && totalPages > 1;
  if (shouldBackToPrevPage) currentPage.value = Math.max(1, totalPages - 1);
  else refreshWorkData();
};

// 標籤
const {
  data: tags,
  error: tagError,
  refresh: refreshTagData,
} = await useFetch('/api/admin/tags/all');

const tagMenu = computed(() => tags.value?.map((tag) => tag.name));

watch([workError, tagError], ([newWorkError, newTagError]) => {
  const err = newWorkError ?? newTagError;
  if (err) toast.error(getErrorMessage(err, '資料取得失敗，請稍後再試'));
});

// =============== 表格相關 ===============
const columns: TableColumn<AdminWorkItem>[] = [
  { accessorKey: 'title', header: '標題' },
  { accessorKey: 'category', header: '分類' },
  { accessorKey: 'tags', header: '標籤' },
  { accessorKey: 'isPublic', header: '公開狀態' },
  { accessorKey: 'updatedAt', header: '更新時間' },
  { accessorKey: 'actions', header: '操作' },
];

const skeletonData = Array(PAGE_SIZE) as unknown as AdminWorkItem[];
const shouldShowSkeleton = useDelayedDisplay(isWorkDataLoading);

// 刪除作品
const confirmDelete = useDeleteModal();
const handleWorkDelete = (work: AdminWorkItem) => {
  confirmDelete({
    itemTypeName: '作品',
    itemTitle: work.title,
    onConfirm: () => deleteWork(work.id),
  });
};

const deleteWork = async (id: string) => {
  try {
    await $fetch(`/api/admin/works/${id}`, {
      method: 'DELETE',
    });
    refreshWorkOrGoPrevPage();
    refreshTagData();
    toast.success('作品刪除成功');
  } catch (error) {
    toast.error(getErrorMessage(error, '作品刪除失敗，請稍後再試'));
  }
};

// 新增編輯作品
const isWorkModalOpen = ref(false);
const workModalMode = ref<WorkModalMode>('add');
const tempWorkData = ref<AdminWorkItem | null>(null);

const openWorkModal = (mode: WorkModalMode, row: AdminWorkItem | null = null) => {
  workModalMode.value = mode;
  tempWorkData.value = row;
  isWorkModalOpen.value = true;
};

const handleWorkModalSave = () => {
  if (workModalMode.value === 'add') {
    if (currentCategory.value !== 'all') currentCategory.value = 'all';
    else if (currentPage.value !== 1) currentPage.value = 1;
    else refreshWorkData();
  } else if (workModalMode.value === 'edit') {
    refreshWorkOrGoPrevPage();
  }
  refreshTagData();
};

// 編輯標籤
const isTagEditorOpen = ref(false);

const handleTagEditorSave = () => {
  refreshTagData();
  refreshWorkData();
};
</script>

<style scoped></style>
