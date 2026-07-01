<template>
  <div class="one-content-page container flex min-h-[calc(100dvh-68px)] flex-col">
    <!-- 標題 -->
    <div class="mb-6 flex flex-col lg:mb-10 lg:flex-row-reverse lg:items-end lg:justify-between">
      <div class="section-overline">WORKS SHOWCASE</div>
      <h1 class="section-title">作品展示</h1>
    </div>

    <!-- 篩選 -->
    <div class="mb-6 lg:mb-10">
      <!-- 分類 -->
      <UTabs
        v-model="currentCategory"
        :items="categoryFilterItems"
        color="primary"
        variant="link"
        :content="false"
        :ui="{
          list: 'gap-4 border-0 p-0 lg:gap-6',
          indicator: 'hidden!',
          trigger: 'px-0 py-0 text-base font-normal after:hidden! data-[state=active]:font-medium',
        }"
      />

      <!-- 標籤 -->
      <ul
        v-if="tagFilterItems.length > 0"
        class="mt-4 flex flex-wrap gap-x-4 gap-y-3 lg:mt-6 lg:gap-x-6"
      >
        <li v-for="tag in tagFilterItems" :key="tag.id">
          <LazyUCheckbox
            :id="`tag-${tag.id}`"
            :aria-label="`${tag.name}(${tag.workUsageCount})`"
            :model-value="currentTagIds.includes(tag.id)"
            :ui="{
              label: 'flex items-center gap-0.5',
            }"
            @update:model-value="(checked: boolean) => toggleTagFilter(tag.id, checked)"
          >
            <template #label>
              <span class="leading-none">{{ tag.name }}</span>
              <span class="text-sub text-sm leading-none">({{ tag.workUsageCount }})</span>
            </template>
          </LazyUCheckbox>
        </li>
      </ul>

      <!-- 預留空間 -->
      <div v-else class="mt-4 h-5 lg:mt-6" />
    </div>

    <!-- 作品列表 -->
    <div
      v-if="shouldShowWorkSkeleton"
      class="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-12"
    >
      <WorkCard v-for="i in PAGE_SIZE" :key="i" />
    </div>

    <div
      v-else-if="(workData?.works.length ?? 0) > 0"
      class="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-12"
    >
      <WorkCard v-for="work in workData?.works" :key="work.id" :work="work" title-tag="h2" />
    </div>

    <div v-else class="flex grow flex-col items-center justify-center">
      <span>找不到作品</span>
      <UButton
        label="重置篩選條件"
        color="neutral"
        variant="link"
        size="sm"
        icon="i-material-symbols-refresh"
        :ui="{
          base: '-ml-1 text-sm',
          leadingIcon: '-mb-0.5 size-4.5',
        }"
        :disabled="isWorkDataLoading"
        @click="reloadWorkData"
      />
    </div>

    <!-- 分頁 -->
    <UPagination
      v-if="workData?.works && workData.works.length > 0"
      v-model:page="currentPage"
      :items-per-page="PAGE_SIZE"
      :total="totalWorkCount"
      class="mt-auto flex justify-center pt-10 sm:pt-14 lg:pt-18"
    />
  </div>
</template>

<script lang="ts" setup>
import type { categories } from '#shared/constants/work';
import { categoryOptions } from '#shared/constants/work';
import type { TabsItem } from '@nuxt/ui';

type Category = (typeof categories)[number];

const route = useRoute();
const router = useRouter();
const toast = useAppToast();

const categoryFilterItems: TabsItem[] = [{ label: '全部分類', value: 'all' }, ...categoryOptions];
const currentCategory = ref<'all' | Category>('all');

const currentTagIds = ref<number[]>([]);

const currentPage = ref(1);
const PAGE_SIZE = 12;

const isSyncingFromRoute = ref(false);

const syncStateFromQuery = async () => {
  isSyncingFromRoute.value = true;

  currentCategory.value = (route.query.category as Category) ?? 'all';
  currentTagIds.value = route.query.tag ? String(route.query.tag).split(',').map(Number) : [];
  currentPage.value = route.query.page ? Number(route.query.page) : 1;

  await nextTick();
  isSyncingFromRoute.value = false;
};

// 初次載入時，從路由帶入初始狀態
await syncStateFromQuery();

// =============== 標籤相關 ===============
const { data: tagData, error: tagError } = await useLazyFetch('/api/tags');

const tagFilterItems = computed(() => {
  if (!tagData.value) return [];

  if (currentCategory.value === 'all') {
    const seen = new Set<number>();
    return Object.values(tagData.value)
      .flat()
      .filter((tag) => !seen.has(tag.id) && seen.add(tag.id));
  }

  return tagData.value[currentCategory.value];
});

const toggleTagFilter = (id: number, checked: boolean) => {
  if (checked) currentTagIds.value = [...currentTagIds.value, id];
  else currentTagIds.value = currentTagIds.value.filter((tagId) => tagId !== id);
};

const tagFilterQuery = computed(() =>
  currentTagIds.value.length ? [...currentTagIds.value].sort((a, b) => a - b).join(',') : undefined,
);

// =============== 作品相關 ===============
const {
  data: workData,
  pending: isWorkDataLoading,
  error: workError,
  refresh: refreshWorkData,
} = await useLazyFetch('/api/works', {
  query: {
    page: currentPage,
    page_size: PAGE_SIZE,
    category: currentCategory,
    tags: tagFilterQuery,
  },
  watch: false,
});

const shouldShowWorkSkeleton = useDelayedDisplay(isWorkDataLoading);
const totalWorkCount = computed(() => (workData.value?.pagination.totalPages ?? 0) * PAGE_SIZE);

// 切換分類時，重置標籤篩選與分頁
watch(currentCategory, () => {
  if (isSyncingFromRoute.value) return;
  currentTagIds.value = [];
  currentPage.value = 1;
});

// 切換標籤時，重置分頁
watch(currentTagIds, () => {
  if (isSyncingFromRoute.value) return;
  currentPage.value = 1;
});

// 改變篩選或分頁時，只調整網址 query，由下方的 watch 觸發請求
watch([currentCategory, currentTagIds, currentPage], () => {
  if (isSyncingFromRoute.value) return;

  router.push({
    query: {
      category: currentCategory.value === 'all' ? undefined : currentCategory.value,
      tag:
        currentTagIds.value.length === 0
          ? undefined
          : [...currentTagIds.value].sort((a, b) => a - b).join(','),
      page: currentPage.value === 1 ? undefined : currentPage.value,
    },
  });
});

const reloadWorkData = () => {
  router.push({ query: {} });
};

// 唯一的請求觸發點
watch(
  () => route.fullPath,
  async () => {
    await syncStateFromQuery();
    refreshWorkData();
  },
);

watch([workError, tagError], ([newWorkError, newTagError]) => {
  const err = newWorkError ?? newTagError;
  if (err) toast.error(getErrorMessage(err, '資料取得失敗，請稍後再試'));
});
</script>

<style scoped></style>
