<template>
  <UModal
    v-model:open="isModalOpen"
    :dismissible="false"
    :ui="{
      content: 'h-full max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-5xl md:max-h-[75dvh]',
      body: 'relative overflow-hidden',
      footer: 'flex items-center justify-between gap-3',
    }"
  >
    <template #title>
      選擇圖片
      <span v-show="tempSelectedImages.length" class="text-sub font-sans text-sm font-normal">
        已選擇 {{ tempSelectedImages.length }} 張圖片
      </span>
    </template>

    <template #body>
      <!-- 頂部操作按鈕 -->
      <div class="mb-6 flex items-end justify-between gap-3">
        <div class="flex items-center gap-3">
          <UTabs
            v-model="usageFilter"
            :items="usageFilterTabItems"
            color="primary"
            variant="link"
            :content="false"
            :ui="{
              list: 'gap-3 border-0 p-0',
              indicator: 'h-0.5',
              trigger: 'px-0 py-2 font-normal data-[state=active]:font-medium',
            }"
          />
          <UButton
            title="重新載入"
            color="neutral"
            variant="link"
            size="sm"
            icon="i-material-symbols-refresh"
            :ui="{
              base: '-mb-0.5',
              leadingIcon: 'size-4.5',
            }"
            :disabled="isLoading"
            @click="reloadData"
          />
        </div>

        <AdminImageUploader @success="uploadImageCallback" />
      </div>

      <!-- 圖片列表 -->
      <div
        ref="scrollContainer"
        class="mb-1 flex h-[calc(100%-64px)] scrollbar-gutter-stable overflow-y-scroll"
      >
        <div
          class="grid grid-cols-2 content-start gap-1 md:grid-cols-4 lg:grid-cols-5"
          :class="{
            'w-0': !data && imageList.length === 0,
            'w-full': shouldShowSkeleton,
          }"
        >
          <!-- 骨架屏 -->
          <template v-if="shouldShowSkeleton">
            <USkeleton v-for="i in 20" :key="i" class="aspect-square h-full w-full" />
          </template>

          <template v-if="imageList.length">
            <div
              v-for="image in imageList"
              :key="image.id"
              role="button"
              tabindex="0"
              class="group aspect-square cursor-pointer ring-inset"
              :class="{ 'ring-primary p-1.5 ring-2': isSelected(image.id) }"
              @click="toggleSelectImage(image)"
              @keyup.enter="toggleSelectImage(image)"
            >
              <div class="relative h-full w-full">
                <!-- 圖片本體 -->
                <img
                  :src="image.path"
                  alt="圖片"
                  decoding="async"
                  loading="lazy"
                  class="bg-elevated h-full w-full object-cover"
                />

                <!-- 選擇打勾 -->
                <Icon
                  v-if="isSelected(image.id)"
                  name="i-fe-check"
                  size="26"
                  mode="svg"
                  class="text-primary absolute top-0.5 right-0.5 stroke-white stroke-4 [paint-order:stroke_fill] [stroke-linejoin:round]"
                />

                <!-- 圖片操作按鈕 -->
                <div
                  class="absolute inset-x-0 bottom-0 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
                  :class="isSelected(image.id) ? 'visible opacity-100' : 'invisible'"
                >
                  <div class="flex w-full opacity-70">
                    <UButton
                      color="neutral"
                      variant="solid"
                      size="xs"
                      class="hover:bg-ink active:bg-ink grow justify-center p-1 text-sm leading-4 transition-opacity hover:opacity-85 active:opacity-85"
                      @click.stop="openPreview(image.path)"
                    >
                      預覽
                    </UButton>
                    <UButton
                      v-if="usageFilter === 'false'"
                      title="刪除"
                      color="error"
                      variant="solid"
                      size="xs"
                      icon="i-lucide-trash-2"
                      class="px-1.5 py-0.5"
                      @click.stop="handleDelete(image)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div
          v-if="!data?.images.length && !shouldShowSkeleton"
          class="text-sub flex w-full flex-col items-center gap-1 self-center py-6 text-sm"
        >
          <Icon name="i-ix-no-image" />
          沒有圖片
        </div>
      </div>

      <!-- 分頁資訊 -->
      <div
        v-show="isScrolling && imageList.length !== 0"
        class="absolute inset-x-0 bottom-8 flex justify-center"
      >
        <UBadge
          color="neutral"
          variant="soft"
          class="text-ink/80 rounded-full px-3 font-medium opacity-90"
        >
          {{ displayCurrentPage }} / {{ data?.pagination.totalPages ?? 0 }} 頁
        </UBadge>
      </div>
    </template>

    <template #footer>
      <div
        title="儲存空間"
        class="flex flex-col items-start gap-1 text-xs sm:flex-row sm:items-center sm:gap-3 sm:text-sm"
      >
        <span class="text-nowrap">
          {{ data?.totalSizeText ?? 0 }} / {{ data?.maxSizeText ?? 0 }}
        </span>
        <UProgress
          :color="(data?.usedPercent ?? 0) > 80 ? 'error' : 'success'"
          :model-value="data?.usedPercent ?? 0"
          class="w-30"
        />
      </div>

      <div class="flex gap-3">
        <UButton
          label="取消"
          color="neutral"
          variant="link"
          size="sm"
          @click="isModalOpen = false"
        />
        <UButton
          label="確認"
          color="primary"
          variant="solid"
          size="sm"
          :disabled="tempSelectedImages.length === 0"
          @click="confirmSelection"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { ImageItem } from '#shared/types/work';
import type { TabsItem } from '@nuxt/ui';

const isModalOpen = defineModel<boolean>('open', { default: false });

const props = withDefaults(
  defineProps<{
    mode?: 'single' | 'multiple';
    selectedImages?: ImageItem[];
  }>(),
  {
    mode: 'single',
    selectedImages: () => [],
  },
);

const emit = defineEmits<{
  select: [images: ImageItem[]];
}>();

const toast = useAppToast();

const usageFilterTabItems: TabsItem[] = [
  { label: '當前選擇', value: 'current' },
  { label: '未使用', value: 'false' },
  { label: '已使用', value: 'true' },
];

// =============== 取得圖片 ===============
const currentPage = ref(1);
const PAGE_SIZE = 20;
const usageFilter = ref<'true' | 'false' | 'current'>('false');
const imageList = ref<ImageItem[]>([]); // 真正拿來渲染的資料

const {
  data,
  refresh: getData,
  error,
  pending: isLoading,
} = useLazyFetch('/api/admin/images', {
  query: {
    page: currentPage,
    page_size: PAGE_SIZE,
    is_used: usageFilter,
  },
  immediate: false,
  watch: false,
});

const shouldShowSkeleton = useDelayedDisplay(isLoading);

const reloadData = () => {
  scrollContainer.value?.scrollTo(0, 0);
  resetInfiniteScroll();
  if (currentPage.value === 1) getData();
  else currentPage.value = 1; // 由 currentPage 的 watch 取資料
};

watch(usageFilter, () => {
  if (usageFilter.value === 'current') {
    imageList.value = tempSelectedImages.value;
    return;
  }
  reloadData();
});

watch(currentPage, () => {
  getData();
});

watch(data, async (newData) => {
  if (!newData?.images) return;
  if (currentPage.value === 1) imageList.value = newData.images;
  else imageList.value.push(...newData.images);
});

watch(error, (newError) => {
  if (newError) toast.error(newError.data.message || '資料取得失敗，請稍後再試');
});

let isFirstOpen = true;

watch(isModalOpen, (open) => {
  if (!open) {
    tempSelectedImages.value = [];
    return;
  }

  tempSelectedImages.value = props.selectedImages ? [...props.selectedImages] : [];

  if (props.selectedImages.length > 0) {
    usageFilter.value = 'current';
    imageList.value = props.selectedImages;
    return;
  }

  if (isFirstOpen) {
    isFirstOpen = false;
    getData();
    return;
  }

  if (usageFilter.value === 'true') {
    usageFilter.value = 'false';
    return;
  }
});

const uploadImageCallback = () => {
  if (usageFilter.value === 'true') usageFilter.value = 'false';
  else reloadData();
};

// =============== 滾動加載 ===============
const scrollContainer = useTemplateRef('scrollContainer');
const { y: scrollTop, isScrolling } = useScroll(scrollContainer);

const { reset: resetInfiniteScroll } = useInfiniteScroll(
  scrollContainer,
  () => {
    if (scrollTop.value === 0 || isLoading.value) return;

    const hasBaseImageQuantity = imageList.value.length >= PAGE_SIZE;
    if (!hasBaseImageQuantity) return;

    currentPage.value += 1;
  },
  {
    distance: 0,
    canLoadMore: () => data.value?.pagination.hasNextPage ?? false,
  },
);

const displayCurrentPage = computed(() => {
  const el = scrollContainer.value;
  if (!el || imageList.value.length === 0) return 0;

  const gridEl = el.firstElementChild as HTMLElement;
  if (!gridEl) return 0;

  const items = gridEl.children;
  if (items.length < 2) return 1;

  let itemsPerRow = items.length;
  for (let i = 1; i < items.length; i++) {
    if ((items[i] as HTMLElement).offsetLeft === (items[0] as HTMLElement).offsetLeft) {
      itemsPerRow = i;
      break;
    }
  }

  const totalRows = Math.ceil(imageList.value.length / itemsPerRow);
  const rowHeight = gridEl.scrollHeight / totalRows;

  const rowsPerPage = Math.ceil(PAGE_SIZE / itemsPerRow);
  const pageHeight = rowHeight * rowsPerPage;

  const calculatedPage = Math.floor(scrollTop.value / pageHeight) + 1;

  const totalPages = data.value?.pagination.totalPages ?? 1;
  return Math.min(Math.max(calculatedPage, 1), totalPages);
});

// =============== 選擇圖片 ===============
const tempSelectedImages = ref<ImageItem[]>([]);

const isSelected = (imageId: string) =>
  tempSelectedImages.value.some((image) => image.id === imageId);

const toggleSelectImage = (image: ImageItem) => {
  if (props.mode === 'single') {
    tempSelectedImages.value = [image];
    return;
  }

  if (isSelected(image.id)) {
    tempSelectedImages.value = tempSelectedImages.value.filter((item) => item.id !== image.id);
  } else {
    tempSelectedImages.value = [...tempSelectedImages.value, image];
  }
};

const confirmSelection = () => {
  emit('select', tempSelectedImages.value);
  isModalOpen.value = false;
};

// =============== 圖片操作 ===============
// 預覽
const { openLightbox } = useLightbox();

const openPreview = (path: string) => {
  const slides = [{ type: 'image', src: path }];
  openLightbox({ slides });
};

// 刪除
const confirmDelete = useDeleteModal();

const handleDelete = async (image: ImageItem) => {
  const confirmed = await confirmDelete({
    itemTypeName: '圖片',
    itemImage: image.path,
  });

  if (!confirmed) return;

  try {
    await $fetch(`/api/admin/images/${image.id}`, {
      method: 'DELETE',
    });
    toast.success('圖片刪除成功');
    reloadData();
    tempSelectedImages.value = tempSelectedImages.value.filter((item) => item.id !== image.id);
  } catch (error) {
    toast.error(getErrorMessage(error, '圖片刪除失敗，請稍後再試'));
  }
};
</script>

<style scoped></style>
