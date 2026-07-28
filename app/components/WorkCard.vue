<template>
  <div>
    <NuxtLink v-if="props.work" :to="`/works/${props.work.slug}`" class="card group">
      <div class="mb-4 aspect-square">
        <AppImg
          :src="props.work.cover.path"
          width="488"
          height="488"
          alt="作品封面圖"
          sizes="100vw sm:50vw lg:33vw"
          fit="cover"
          :loading="props.isLazyLoadImage ? 'lazy' : undefined"
          class="bg-canvas h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-75"
        />
      </div>

      <div class="flex items-end justify-between gap-10">
        <div class="flex min-w-0 items-end">
          <component :is="props.titleTag" class="truncate text-xl leading-none">
            {{ props.work.title }}
          </component>
          <span class="text-sub ml-0.5 shrink-0 pb-0.5 text-sm leading-none">
            ｜{{ categoryLabels[props.work.category] }}
          </span>
        </div>

        <div class="card-more-label shrink-0 leading-none">
          <span
            v-for="(char, index) in 'MORE'"
            :key="index"
            class="text-brand-main inline-block text-xs font-bold transition-transform"
          >
            {{ char }}
          </span>
        </div>
      </div>
    </NuxtLink>

    <!-- 骨架屏 -->
    <div v-else>
      <LazyUSkeleton class="mb-4 aspect-square" />
      <div class="flex items-end justify-between">
        <LazyUSkeleton class="h-5 w-30" />
        <LazyUSkeleton class="h-4 w-9" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { categoryLabels } from '#shared/constants/work';

const props = withDefaults(
  defineProps<{
    work?: WorkItem | null;
    isLazyLoadImage?: boolean;
    titleTag?: string;
  }>(),
  {
    work: null,
    isLazyLoadImage: false,
    titleTag: 'h3' as string,
  },
);
</script>

<style scoped>
@keyframes letter-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.card:hover .card-more-label span {
  animation: letter-bounce 0.4s ease both;
}
.card:hover .card-more-label span:nth-child(1) {
  animation-delay: 0ms;
}
.card:hover .card-more-label span:nth-child(2) {
  animation-delay: 60ms;
}
.card:hover .card-more-label span:nth-child(3) {
  animation-delay: 120ms;
}
.card:hover .card-more-label span:nth-child(4) {
  animation-delay: 180ms;
}
</style>
