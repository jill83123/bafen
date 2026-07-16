<template>
  <section
    class="border-sub flex h-[calc(100dvh-68px)] min-h-125 flex-col overflow-hidden border-b lg:min-h-150"
  >
    <div class="flex h-[87%] flex-col lg:h-[85%] lg:flex-row">
      <div
        class="border-sub bg-canvas relative mr-8 h-[70%] border-r border-b lg:mr-0 lg:h-full lg:w-[68%] xl:w-[72%] 2xl:w-[76%]"
      >
        <!-- 輪播本體 -->
        <ClientOnly>
          <Swiper
            :modules="[Autoplay, EffectFade, Pagination]"
            :loop="true"
            :slides-per-view="1"
            :space-between="0"
            :effect="'fade'"
            :fade-effect="{ crossFade: true }"
            :speed="600"
            :autoplay="{ delay: 3000, disableOnInteraction: false }"
            :pagination="paginationOptions"
          >
            <SwiperSlide v-for="(image, index) in images" :key="index">
              <img
                :src="image"
                width="1446"
                height="714"
                alt="主視覺圖片"
                :fetchpriority="image === firstImage ? 'high' : 'auto'"
                :loading="image === firstImage ? 'eager' : 'lazy'"
                class="kenburns h-full w-full object-cover"
              />
            </SwiperSlide>
          </Swiper>

          <template #fallback>
            <img
              v-if="firstImage"
              :src="firstImage"
              width="1446"
              height="714"
              alt="主視覺圖片"
              fetchpriority="high"
              loading="eager"
              class="h-full w-full object-cover"
            />
          </template>

          <!-- 輪播分頁 -->
          <div class="custom-pagination absolute -bottom-10! z-10 flex w-fit gap-3 p-3" />
        </ClientOnly>

        <!-- 手機版：灰色裝飾背景 -->
        <div
          class="bg-canvas border-sub absolute top-[90%] -right-8 -bottom-10 left-[40%] -z-10 border border-r-0 lg:hidden"
        />
      </div>

      <!-- 標題 + 描述區塊 -->
      <div class="flex grow items-center justify-center gap-6 pt-15 lg:flex-col lg:pt-0">
        <div class="hidden h-full flex-col items-center justify-evenly lg:flex">
          <!-- 大標 -->
          <h1 class="flex flex-col gap-4 font-serif">
            <span class="text-7xl">八分</span>
            <span class="text-xl tracking-[1em]">室內裝修</span>
          </h1>

          <!-- 斜線 -->
          <svg viewBox="0 0 82 142" class="text-sub h-35.5 w-35.5">
            <line x1="0" y1="142" x2="82" y2="0" stroke="currentColor" stroke-width="1" />
          </svg>
        </div>

        <!-- 描述 -->
        <div class="description-fade-in text-sm leading-loose opacity-0 lg:text-base">
          <p>專屬設計， 打造獨特家居風格；</p>
          <p>用心服務，為您呈現更理想的生活空間。</p>
        </div>
      </div>
    </div>

    <!-- 底部區塊 -->
    <div class="relative grow">
      <!-- 電腦版：灰色裝飾背景 -->
      <div
        class="bg-canvas border-sub relative z-[-1] -mt-26.5 ml-auto hidden h-[calc(100%+106px)] border-t border-l lg:block lg:w-[68%] xl:w-[72%] 2xl:w-[76%]"
      />

      <!-- 滾動提示 -->
      <div
        class="scroll-bounce absolute bottom-1/2 left-1/2 flex -translate-x-1/2 translate-y-1/2 flex-col items-center"
      >
        <div class="text-sm">SCROLL</div>
        <Icon name="i-lsicon-down-filled" size="18" />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';

const route = useRoute();

const imageModules = import.meta.glob<{ default: string }>('@/assets/images/index/header_*.webp', {
  eager: true,
});

const images = Object.entries(imageModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([_, module]) => module.default);

const firstImage = images[0];

// 讓瀏覽器更早開始下載首圖，改善 LCP
useHead(() => ({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: firstImage,
      type: 'image/webp',
      fetchpriority: 'high',
    },
  ],
}));

const paginationOptions = {
  el: '.custom-pagination',
  clickable: true,
  renderBullet: (index: number, className: string) => {
    return `<span class="custom-bullet ${className}"></span>`;
  },
};

// 淡入效果
const { fadeIn } = useFadeIn();
const { replay: replayDescriptionFadeIn } = fadeIn('.description-fade-in', {
  direction: 'left',
  immediate: true,
});

watch(
  () => route.hash,
  () => {
    if (!route.hash) replayDescriptionFadeIn();
  },
);
</script>

<style scoped>
@reference "tailwindcss";

.swiper {
  @apply h-full;
}
:deep(.custom-bullet) {
  @apply m-0! cursor-pointer border border-(--color-sub) bg-transparent opacity-100 transition-all duration-300;
}
:deep(.swiper-pagination-bullet-active) {
  @apply bg-(--color-sub);
}

/*
  輪播動畫：
  speed ≈ delay × 0.2
  animation duration ≈ delay + speed
  scale 增量 ≈ animation duration × 0.0167
*/
.kenburns {
  animation: none;
  transform: scale(1.06);
}
:deep(.swiper-slide-active) .kenburns {
  animation: kenburns-zoom 3.6s ease-out forwards;
}
@keyframes kenburns-zoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.06);
  }
}

/* 滾動提示動畫 */
.scroll-bounce {
  animation: scroll-bounce 1.5s ease-in-out infinite;
}
@keyframes scroll-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}
</style>
