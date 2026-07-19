<template>
  <div>
    <!-- Hero -->
    <IndexHero />

    <!-- 近期作品 -->
    <section class="section relative" aria-label="近期作品">
      <LazyRecentWorks />

      <UButton
        label="查看更多"
        color="neutral"
        variant="outline"
        size="lg"
        trailing-icon="i-lucide-arrow-up-right"
        to="/works"
        class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
      />
    </section>

    <!-- 作品類型 -->
    <section class="section lg:pb-0!" aria-label="作品類型">
      <!-- 標題 -->
      <div>
        <div class="category-fade-in">
          <div class="section-overline text-center">CATEGORY</div>
          <h2 class="section-title mb-6 text-center lg:mb-10">作品類型</h2>
        </div>
      </div>

      <div class="grid gap-y-3 px-3 lg:grid-cols-3 lg:px-0">
        <NuxtLink
          v-for="category in categoryOptions"
          :key="category.value"
          :to="{
            path: '/works',
            query: { category: category.value },
          }"
          class="group after:bg-ink/50 hover:after:bg-ink/0 relative overflow-hidden after:absolute after:inset-0 after:transition-colors lg:max-h-[calc(100dvh-68px)]"
        >
          <!-- 圖片 -->
          <picture class="block aspect-1536/375 w-full lg:aspect-623/842">
            <source media="(min-width: 1024px)" :srcset="getCategoryImage(`${category.value}`)" />
            <source media="(min-width: 640px)" :srcset="getCategoryImage(`${category.value}_md`)" />
            <img
              :src="getCategoryImage(`${category.value}_sm`)"
              alt="作品類型封面圖"
              width="623"
              height="842"
              class="bg-canvas min-h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </picture>

          <!-- 標題 -->
          <h3
            class="absolute right-0 bottom-0 z-1 p-3 font-serif text-3xl font-medium text-white md:text-4xl lg:p-6 xl:text-5xl"
          >
            {{ category.label }}
          </h3>
        </NuxtLink>
      </div>
    </section>

    <!-- 關於八分 -->
    <section
      id="about"
      class="bg-canvas section scroll-m-10 overflow-hidden lg:-scroll-m-10"
      aria-label="關於八分"
    >
      <div class="container mb-15 grid grid-cols-1 gap-6 lg:mb-17 lg:grid-cols-12">
        <div class="order-2 flex flex-col lg:order-1 lg:col-span-6 xl:col-span-5 xl:col-start-2">
          <img
            src="@/assets/images/index/about_certificate.webp"
            width="640"
            height="905"
            alt="建築物室內裝修業登記證"
            class="border-sub my-auto w-full border"
          />
        </div>

        <!-- 主要內容 -->
        <div
          class="about-fade-in-trigger order-1 flex h-full flex-col justify-center space-y-7 lg:order-2 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-8 2xl:space-y-8"
        >
          <div class="mb-7">
            <div class="about-fade-in">
              <div class="section-overline">ABOUT</div>
              <h2 class="section-title mb-7">關於八分</h2>
            </div>

            <blockquote class="about-fade-in text-brand-main text-2xl font-medium">
              家是生活的舞台，<br />
              室內裝修是生活品質的提升。
            </blockquote>
          </div>

          <div class="about-fade-in space-y-4">
            <p>
              我們致力於為每一個家庭打造一個獨一無二的家居空間，讓您的家成為一個真正的溫馨港灣，一個能夠反映您個性和品味的地方。
            </p>
            <p>
              從設計到施工，我們堅持以專業和創新的態度，為您打造一個完美的家，讓您和您的家人能夠在這裡創造無數美好時刻，共同享受幸福和快樂。
            </p>
          </div>

          <div>
            <img
              src="@/assets/images/index/about.webp"
              width="623"
              height="477"
              alt="色票與材質卡"
              class="about-fade-in h-full max-h-full w-full object-cover object-bottom-left"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 服務項目 -->
    <section
      id="services"
      class="section relative scroll-m-40 border-b-0! pt-20! lg:pt-30!"
      aria-label="服務項目"
    >
      <div class="absolute inset-x-0 top-0">
        <!-- 頂部半圓 -->
        <div
          class="relative mx-auto h-15 w-full max-w-96 -translate-y-full overflow-hidden lg:h-17 lg:max-w-lg"
        >
          <div
            class="absolute top-0 left-0 h-96 w-96 rounded-full border border-(--color-sub) bg-white lg:h-128 lg:w-lg"
          />
        </div>
      </div>

      <!-- 星星 -->
      <div class="absolute top-0 left-1/2">
        <Icon
          name="i-custom-iconoir-spark-solid"
          class="text-brand-decor absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl! lg:text-[40px]!"
        />
      </div>

      <!-- 標題 -->
      <div class="mb-15 text-center lg:mb-30">
        <div class="section-overline">SERVICES</div>
        <h2 class="section-title">服務項目</h2>
      </div>

      <div class="container">
        <ul class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <li v-for="(service, index) in serviceItems" :key="index">
            <div class="service-fade-in flex w-full flex-col items-center p-4">
              <Icon :name="service.icon" size="100" class="mb-7" />
              <h3 class="text-brand-main mb-4 text-2xl font-medium">{{ service.title }}</h3>
              <p>{{ service.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- 服務流程 -->
    <section aria-label="服務流程">
      <div class="lg:mt-15">
        <img src="@/assets/images/index/process_separator.svg" alt="" />
      </div>

      <div id="process" class="bg-canvas section scroll-m-10 border-b-0! lg:-scroll-m-10">
        <div class="relative container">
          <!-- 標題 -->
          <div class="pl-3 lg:pl-0">
            <div class="section-overline">PROCESS</div>
            <h2 class="section-title mb-10 lg:mb-15">服務流程</h2>
          </div>

          <!-- 裝飾箭頭 -->
          <div class="absolute top-1/3 hidden flex-col sm:left-6 md:flex lg:left-3">
            <Icon name="i-ri-arrow-down-wide-line" size="48" class="text-brand-decor" />
            <Icon name="i-ri-arrow-down-wide-line" size="48" class="text-brand-decor" />
            <Icon name="i-ri-arrow-down-wide-line" size="48" class="text-brand-decor" />
          </div>

          <div class="relative mx-auto max-w-163 pl-6 md:px-0">
            <!-- 直線 -->
            <div class="bg-ink absolute inset-y-0 w-px md:left-[22.4%] lg:left-[42.3%]" />

            <ul
              class="process-fade-in-trigger flex flex-col gap-15 py-10 md:items-center lg:items-end lg:gap-30 lg:py-17"
            >
              <li
                v-for="(item, index) in processItems"
                :key="index"
                class="process-fade-in relative flex flex-col gap-3 pl-8 sm:pl-12 lg:flex-row lg:items-center lg:gap-12 lg:pl-0"
              >
                <!-- 標題 -->
                <div>
                  <div class="text-brand-main mb-2 text-sm font-bold lg:text-end">
                    STEP {{ index + 1 }}
                  </div>
                  <h3 class="text-2xl font-medium">{{ item.title }}</h3>
                </div>

                <!-- 標記線 -->
                <div class="bg-ink absolute top-11 left-0 h-px w-4 -translate-x-1/2 lg:static" />

                <!-- 描述 -->
                <div class="md:max-w-78">
                  <p>{{ item.description }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="relative">
        <img
          src="@/assets/images/index/process_separator.svg"
          alt=""
          class="absolute inset-x-0 -top-px rotate-180"
        />
      </div>
    </section>

    <!-- 聯絡我們 -->
    <section class="relative pt-8 lg:pt-17" aria-label="聯絡我們">
      <!-- 背景圖 -->
      <div
        class="absolute inset-0 -z-10 bg-cover bg-fixed bg-center opacity-25"
        :style="{ backgroundImage: `url(${contactImage})` }"
      />

      <div class="section flex flex-col justify-center overflow-hidden">
        <h2
          class="mb-6 pl-3 text-center font-serif text-3xl leading-normal text-nowrap lg:mb-10 lg:text-4xl"
        >
          喜歡八分的作品嗎？<br />歡迎與我們做進一步討論！
        </h2>

        <UButton
          label="聯絡我們"
          color="primary"
          variant="solid"
          size="lg"
          to="/contact"
          class="mx-auto"
        />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { categoryOptions } from '#shared/constants/work';
import contactImage from '@/assets/images/contact_bg.webp';

useHead({
  title: '首頁',
});

// =============== 作品類型 ===============
const categoryImages = import.meta.glob('@/assets/images/index/category_*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const getCategoryImage = (filename: string) => {
  return categoryImages[`/assets/images/index/category_${filename}.webp`];
};

// =============== 服務項目 ===============
const serviceItems = [
  {
    icon: 'i-custom-clarity-ruler-pencil-line',
    title: '新成屋規劃',
    description:
      '依現場實際狀況，針對客戶需求和風格偏好來設計規劃，量身訂製為您帶來舒適、時尚的居住體驗。',
  },
  {
    icon: 'i-material-symbols-autorenew',
    title: '老屋／中古屋翻新',
    description: '為老屋／中古屋注入新生，改善室內空間、提升居住品質，打造舒適宜居的居家空間。',
  },
  {
    icon: 'i-custom-boxicons-buildings',
    title: '商辦空間設計',
    description:
      '專業的商辦空間設計裝修服務，致力於為您打造一個優雅、實用的工作環境，提升您的企業形象，吸引更多客戶和合作夥伴。',
  },
  {
    icon: 'i-custom-boxicons-paint',
    title: '油漆工程',
    description:
      '擁有經驗豐富的油漆工程團隊，專注於提供高品質、精密度極高的油漆施工，讓您的牆面焕然一新，散發出獨特的風格和氛圍。',
  },
];

// =============== 服務流程 ===============
const processItems = [
  {
    title: '初步溝通',
    description: '與客戶進行初步會面，了解其需求、喜好、預算以及時間表等方面的細節。',
  },
  {
    title: '現場丈量',
    description: '實地精準測量，現場拍照作為製圖之參考。',
  },
  {
    title: '方案設計和提案',
    description: '基於初步會面的了解，設計師將提出方案設計和提案，並與客戶討論和確認。',
  },
  {
    title: '簽訂設計、工程合約',
    description:
      '確定最終設計方案，包括室內空間布局、家具配置、色彩搭配等，並與客戶簽署設計／工程合同。',
  },
  {
    title: '工程執行',
    description:
      '根據設計方案，開始進行施工工作，包括拆除、結構改造、水電施工、地板鋪設、油漆施工、安裝固定家具等。',
  },
  {
    title: '完工交付予售後保固',
    description: '與客戶驗收交屋，提供一年的售後保固服務，包括故障修復、材料保養和建議等。',
  },
];

// =============== 淡入效果 ===============
const { fadeIn } = useFadeIn();

// 近期作品
fadeIn('.recent-fade-in', { direction: 'right' });

// 作品類型
fadeIn('.category-fade-in', { trigger: 'parent' });

// 關於八分
const { replay: replayAboutFadeIn } = fadeIn('.about-fade-in', {
  direction: 'left',
  trigger: '.about-fade-in-trigger',
});

// 服務項目
const { replay: replayServiceFadeIn } = fadeIn('.service-fade-in', { trigger: 'parent' });

// 服務流程
const { replay: replayProcessFadeIn } = fadeIn('.process-fade-in', {
  stagger: 0.3,
  trigger: '.process-fade-in-trigger',
});

// 切換 hash 時觸發淡入效果
const route = useRoute();
watch(
  () => route.hash,
  () => {
    if (route.hash === '#about') replayAboutFadeIn();
    if (route.hash === '#services') replayServiceFadeIn();
    else if (route.hash === '#process') replayProcessFadeIn();
  },
);
</script>

<style scoped>
@reference "tailwindcss";

.section {
  @apply border-b border-(--color-sub) py-20 lg:py-40;
}
</style>
