<template>
  <div class="flex grow flex-col space-y-5">
    <div class="grow">
      <UTable
        :data="shouldShowSkeleton ? skeletonData : (contactData?.contacts ?? [])"
        :columns="columns"
        sticky
        :empty="'沒有資料'"
        :ui="{
          thead: 'after:hidden',
          tr: `${shouldShowSkeleton ? 'hover:bg-transparent!' : ''}`,
        }"
      >
        <!-- 姓名 -->
        <template #name-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-12" />
          <span v-else>{{ row.original.name }}</span>
        </template>

        <!-- Email -->
        <template #email-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-50" />
          <span v-else>{{ row.original.email }}</span>
        </template>

        <!-- 電話 -->
        <template #tel-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-23" />
          <span v-else>{{ row.original.tel }}</span>
        </template>

        <!-- 地址 -->
        <template #address-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-50" />
          <span v-else>{{ row.original.address }}</span>
        </template>

        <!-- 建立時間 -->
        <template #createdAt-cell="{ row }">
          <USkeleton v-if="shouldShowSkeleton" class="h-4.5 w-36" />
          <span v-else>
            {{ new Date(row.original.createdAt).toLocaleString('zh-TW', { hour12: false }) }}
          </span>
        </template>

        <!-- 操作 -->
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-3">
            <template v-if="shouldShowSkeleton">
              <USkeleton class="m-2 h-5 w-5" />
              <USkeleton class="m-2 h-5 w-5" />
            </template>

            <template v-else>
              <UButton
                color="neutral"
                variant="link"
                icon="i-mdi-eye-outline"
                size="sm"
                class="text-ink hover:text-ink/75 p-2"
                @click="openContactModal(row.original)"
              />
              <UButton
                color="error"
                variant="link"
                icon="i-lucide-trash-2"
                class="p-2"
                @click="handleContactDelete(row.original)"
              />
            </template>
          </div>
        </template>
      </UTable>
    </div>

    <UPagination
      v-model:page="currentPage"
      :items-per-page="PAGE_SIZE"
      :total="totalContactCount"
      class="flex justify-center"
    />

    <UModal
      v-model:open="isContactModalOpen"
      title="聯絡資料"
      :dismissible="true"
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <LazyUForm class="mb-3 grid gap-3 sm:grid-cols-3">
          <div class="sm:col-span-1">
            <div class="text-sub mb-1 text-sm">姓名</div>
            <LazyUInput :model-value="selectedContact?.name || ''" readonly />
          </div>

          <div class="sm:col-span-2">
            <div class="text-sub mb-1 text-sm">Email</div>
            <LazyUInput :model-value="selectedContact?.email || ''" readonly />
          </div>

          <div class="sm:col-span-1">
            <div class="text-sub mb-1 text-sm">電話</div>
            <LazyUInput :model-value="selectedContact?.tel || ''" readonly />
          </div>

          <div class="sm:col-span-2">
            <div class="text-sub mb-1 text-sm">地址</div>
            <LazyUInput :model-value="selectedContact?.address || ''" readonly />
          </div>

          <div class="sm:col-span-3">
            <div class="text-sub mb-1 text-sm">需求內容</div>
            <LazyUTextarea :model-value="selectedContact?.content || ''" :rows="5" readonly />
          </div>
        </LazyUForm>

        <div class="text-sub text-sm">
          建立時間：{{
            selectedContact
              ? new Date(selectedContact.createdAt).toLocaleString('zh-TW', { hour12: false })
              : ''
          }}
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';

type AdminContactItem = {
  id: number;
  name: string;
  email: string;
  tel: string;
  address: string;
  content: string;
  createdAt: string;
};

const toast = useAppToast();

// =============== 取得資料 ===============
const currentPage = ref(1);
const PAGE_SIZE = 10;

const {
  data: contactData,
  pending: isContactDataLoading,
  error: contactError,
  refresh: refreshContactData,
} = await useLazyFetch('/api/admin/contacts', {
  query: {
    page: currentPage,
    page_size: PAGE_SIZE,
  },
  watch: false,
});

const totalContactCount = computed(
  () => (contactData.value?.pagination.totalPages ?? 0) * PAGE_SIZE,
);

watch(currentPage, () => {
  refreshContactData();
});

const refreshContactsOrGoPrevPage = () => {
  const { contacts, pagination } = contactData.value ?? {};
  const totalPages = pagination?.totalPages ?? 0;
  const shouldBackToPrevPage = contacts?.length === 1 && totalPages > 1;
  if (shouldBackToPrevPage) currentPage.value = Math.max(1, totalPages - 1);
  else refreshContactData();
};

useErrorToast([contactError]);

// 刪除
const confirmDelete = useDeleteModal();
const handleContactDelete = (contact: AdminContactItem) => {
  confirmDelete({
    itemTypeName: '聯絡資料',
    itemTitle: contact.name,
    onConfirm: () => deleteContact(contact.id),
  });
};

const deleteContact = async (id: number) => {
  try {
    await $fetch(`/api/admin/contacts/${id}`, {
      method: 'DELETE',
    });
    refreshContactsOrGoPrevPage();
    toast.success('聯絡資料刪除成功');
  } catch (error) {
    toast.error(getErrorMessage(error, '聯絡資料刪除失敗，請稍後再試'));
  }
};

// =============== 表格相關 ===============
const columns: TableColumn<AdminContactItem>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'tel', header: '電話' },
  { accessorKey: 'address', header: '地址' },
  { accessorKey: 'createdAt', header: '建立時間' },
  { accessorKey: 'actions', header: '操作' },
];

const skeletonData = Array(PAGE_SIZE) as unknown as AdminContactItem[];
const shouldShowSkeleton = useDelayedDisplay(isContactDataLoading);

const isContactModalOpen = ref(false);
const selectedContact = ref<AdminContactItem | null>(null);

const openContactModal = (contact: AdminContactItem) => {
  selectedContact.value = contact;
  isContactModalOpen.value = true;
};
</script>

<style scoped></style>
