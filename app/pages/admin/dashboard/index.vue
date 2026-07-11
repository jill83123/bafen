<template>
  <div class="space-y-6">
    <div class="grid gap-6 md:grid-cols-2">
      <div class="flex flex-col gap-6">
        <!-- 近 7 天訪客數 -->
        <UCard
          :ui="{
            root: 'grow',
            body: 'flex h-full flex-col gap-3',
          }"
        >
          <h2 class="title">近 7 天訪客數</h2>

          <div class="flex items-center justify-between gap-3">
            <UIcon name="i-material-symbols-add" size="36" class="text-brand-main" />

            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-semibold">{{ analyticsData?.weeklyUsers ?? 0 }}</span>
              <span class="text-sub">人</span>
            </div>
          </div>
        </UCard>

        <!-- 總訪客數 -->
        <UCard
          :ui="{
            root: 'grow',
            body: 'flex h-full flex-col gap-3',
          }"
        >
          <h2 class="title">總訪客數</h2>

          <div class="flex items-center justify-between gap-3">
            <UIcon name="i-material-symbols-group-outline" size="36" class="text-brand-main" />

            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-semibold">{{ analyticsData?.totalUsers ?? 0 }}</span>
              <span class="text-sub">人</span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 熱門作品 -->
      <UCard
        :ui="{
          root: 'flex flex-col',
          body: 'grow p-0!',
        }"
      >
        <!-- 標題 -->
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="title">熱門作品</h2>
            <div class="text-sub text-sm">前三名</div>
          </div>
        </template>

        <!-- 骨架 -->
        <template v-if="shouldShowTopWorksSkeleton">
          <ul>
            <li v-for="index in 3" :key="index" class="flex items-center gap-3 px-6 py-3">
              <!-- 序號 -->
              <div class="font-serif text-lg font-medium">{{ `${index}.` }}</div>

              <!-- 封面 -->
              <USkeleton class="h-14 w-14 shrink-0" />

              <!-- 內容 -->
              <div class="flex-1 space-y-1">
                <USkeleton class="h-6 w-30" />
                <USkeleton class="h-5 w-14" />
              </div>
            </li>
          </ul>
        </template>

        <template v-else-if="topWorks.length > 0">
          <ul>
            <li
              v-for="(item, index) in topWorks"
              :key="item.id"
              class="hover:bg-canvas flex items-center gap-3 px-6 py-3"
            >
              <!-- 序號 -->
              <div class="font-serif text-lg font-medium">{{ `${index + 1}.` }}</div>

              <!-- 封面 -->
              <img :src="item.cover.path" alt="作品封面" class="h-14 w-14 shrink-0 object-cover" />

              <!-- 內容 -->
              <div class="min-w-0 flex-1 space-y-1">
                <h3 class="truncate font-medium">{{ item.title }}</h3>
                <div class="text-sub text-sm">瀏覽量：{{ item.views }}</div>
              </div>
            </li>
          </ul>
        </template>

        <div v-else class="text-sub flex h-full items-center justify-center p-6">尚無資料</div>
      </UCard>
    </div>

    <!-- 每月訪客數 -->
    <UCard>
      <!-- 標題 -->
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="title">每月訪客數</h2>
          <div class="text-sub text-sm">近 12 個月趨勢</div>
        </div>
      </template>

      <div class="h-65">
        <!-- 骨架 -->
        <USkeleton v-if="isAnalyticsDataLoading" class="h-full w-full" />

        <!-- 圖表 -->
        <div
          v-else-if="monthlyChartData.length > 0"
          class="h-full overflow-x-auto overflow-y-hidden"
        >
          <div :style="{ minWidth: `${chartMinWidth}px` }">
            <VisXYContainer :data="monthlyChartData" :height="260">
              <VisLine :x="getMonthIndex" :y="getUserCount" :color="'var(--color-primary)'" />
              <VisCrosshair :data="monthlyChartData" :template="buildMonthlyTooltipContent" />
              <VisTooltip />
              <VisAxis type="x" :tick-values="xTickValues" :tick-format="formatMonthTick" />
              <VisAxis type="y" :tick-values="yTickValues" :tick-format="formatUserCountTick" />
            </VisXYContainer>
          </div>
        </div>

        <div v-else class="text-sub flex h-full items-center justify-center">尚無資料</div>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { VisAxis, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/vue';

useHead({
  title: '資訊主頁',
});

type TopWorkItem = WorkItem & { views: number };

type MonthlyChartPoint = {
  index: number;
  month: string;
  users: number;
};

const { data: analyticsData, pending: isAnalyticsDataLoading } =
  await useLazyFetch('/api/admin/analytics');

// =============== 熱門作品 ===============
const topWorks = ref<TopWorkItem[]>([]);
const isTopWorksLoading = ref(false);
const shouldShowTopWorksSkeleton = useDelayedDisplay(
  computed(() => isTopWorksLoading.value || isAnalyticsDataLoading.value),
);

const loadTopWorks = async () => {
  const works = analyticsData.value?.topWorks ?? [];

  if (works.length === 0) {
    topWorks.value = [];
    return;
  }

  isTopWorksLoading.value = true;

  try {
    const results = await Promise.all(
      works.map(async (page) => {
        const slug = page.path?.split('/').pop() ?? '';

        if (!slug) return null;

        try {
          const work = await $fetch<WorkItem>(`/api/works/${encodeURIComponent(slug)}`);
          return { ...work, views: page.views };
        } catch {
          return null;
        }
      }),
    );

    // 過濾不存在的資料
    topWorks.value = results.filter((work) => work !== null);
  } finally {
    isTopWorksLoading.value = false;
  }
};

// 取得 GA4 資料後，再取得作品資料
watch(
  () => analyticsData.value?.topWorks,
  () => loadTopWorks(),
);

// =============== 每月訪客數 ===============
const monthlyChartData = computed<MonthlyChartPoint[]>(() =>
  (analyticsData.value?.monthlyUsers ?? []).map((item, index) => ({
    index,
    month: item.month,
    users: item.users,
  })),
);

const getMonthIndex = (point: MonthlyChartPoint) => point.index;
const getUserCount = (point: MonthlyChartPoint) => point.users;

const buildMonthlyTooltipContent = (point: MonthlyChartPoint) => {
  const [year, month] = point.month.split('-');
  return `
    <ul class="text-sm leading-6">
      <li>年份：${year ?? ''}</li>
      <li>月份：${month ?? ''}</li>
      <li>人數：${point.users.toLocaleString('zh-TW')}</li>
    </ul>
  `;
};

// 圖表寬度計算
const WIDTH_PER_MONTH = 70;
const MIN_CHART_WIDTH = 400;

const chartMinWidth = computed(() =>
  Math.max(MIN_CHART_WIDTH, monthlyChartData.value.length * WIDTH_PER_MONTH),
);

// 強制 x 軸在每個月的 index 都產生刻度，避免 VisAxis 依可用寬度自動精簡刻度數量，只顯示部分月份
const xTickValues = computed(() => monthlyChartData.value.map((item) => item.index));

// x 軸格式，例如：2026-07 -> 2026/07
const formatMonthTick = (value: number) => {
  const item = monthlyChartData.value[value];
  return item ? item.month.replace('-', '/') : '';
};

// y 軸格式，例如：1000 -> 1,000 人
const formatUserCountTick = (value: number) => `${Math.round(value).toLocaleString('zh-TW')} 人`;

// 依資料最大值計算不重複、間距至少為 1 的整數刻度，避免刻度產生小數（如 0.5、1.5），四捨五入後出現重複標籤
const computeIntegerTickValues = (maxValue: number, desiredTicks = 5) => {
  if (maxValue <= 0) return [0];

  const ticks: number[] = [];
  const step = Math.max(1, Math.ceil(maxValue / (desiredTicks - 1)));

  for (let value = 0; value <= maxValue; value += step) {
    ticks.push(value);
  }

  // 補上最大值
  if (ticks[ticks.length - 1] !== maxValue) ticks.push(maxValue);

  return ticks;
};

const yTickValues = computed(() => {
  const maxUsers = Math.max(0, ...monthlyChartData.value.map((item) => item.users));
  return computeIntegerTickValues(maxUsers);
});
</script>

<style scoped>
@reference "tailwindcss";

.title {
  @apply font-serif text-xl font-semibold;
}
</style>
