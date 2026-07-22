<template>
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
    <SwiperSlide v-for="work in props.works" :key="work.id" class="h-full!">
      <WorkCard :work="work" :is-lazy-load-image="true" />
    </SwiperSlide>
  </Swiper>
</template>

<script lang="ts" setup>
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';

const props = withDefaults(
  defineProps<{
    works?: WorkItem[];
  }>(),
  {
    works: () => [],
  },
);

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

defineExpose({
  swiperInstance,
  slideState,
});
</script>

<style scoped></style>
