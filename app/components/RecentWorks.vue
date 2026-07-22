<template>
  <div class="overflow-hidden">
    <div class="container">
      <div class="mb-6 flex items-end justify-between lg:mb-10">
        <!-- 標題 -->
        <div class="recent-fade-in">
          <div class="section-overline">RECENT WORKS</div>
          <h2 class="section-title">近期作品</h2>
        </div>

        <!-- 輪播按鈕 -->
        <ClientOnly>
          <div class="flex gap-4 sm:gap-8">
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              square
              icon="i-lsicon-left-filled"
              :disabled="slideState.isBeginning"
              aria-label="向左滾動瀏覽作品"
              @click="
                () => {
                  swiperInstance?.slidePrev();
                }
              "
            />
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              square
              icon="i-lsicon-right-filled"
              :disabled="slideState.isEnd"
              aria-label="向右滾動瀏覽作品"
              @click="
                () => {
                  swiperInstance?.slideNext();
                }
              "
            />
          </div>
        </ClientOnly>
      </div>

      <!-- 輪播本體 -->
      <ClientOnly>
        <Swiper
          :modules="[Navigation]"
          :space-between="24"
          :breakpoints="{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }"
          class="overflow-visible!"
          @swiper="onSwiper"
          @slide-change="updateSlideState"
        >
          <!-- 載入中 -->
          <template v-if="isWorkDataLoading">
            <SwiperSlide v-for="n in 4" :key="n" class="h-full!">
              <WorkCard />
            </SwiperSlide>
          </template>

          <!-- 載入完成 -->
          <template v-else>
            <SwiperSlide v-for="work in workData?.works" :key="work.id" class="h-full!">
              <WorkCard :work="work" :is-lazy-load-image="true" />
            </SwiperSlide>
          </template>
        </Swiper>
      </ClientOnly>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';

const { data: workData, pending: isWorkDataLoading } = await useLazyFetch('/api/works');

const swiperInstance = ref<SwiperType | null>(null);
const slideState = ref({ isBeginning: true, isEnd: false });

const onSwiper = (swiper: SwiperType) => {
  swiperInstance.value = swiper;
};

const updateSlideState = (swiper: SwiperType) => {
  slideState.value = {
    isBeginning: swiper.isBeginning,
    isEnd: swiper.isEnd,
  };
};
</script>

<style scoped></style>
