<template>
  <template v-if="props.work">
    <NuxtLink :to="`/works/${props.work.slug}`" class="card group">
      <div class="mb-4 aspect-square">
        <img
          :src="props.work.cover.path"
          alt="作品封面圖"
          width="488"
          height="488"
          class="bg-canvas h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-75"
        />
      </div>

      <div class="flex items-end justify-between gap-3">
        <div class="flex min-w-0 items-end">
          <h3 class="truncate text-xl leading-none">{{ props.work.title }}</h3>
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
  </template>

  <!-- 骨架屏 -->
  <template v-else>
    <div>
      <USkeleton class="mb-4 aspect-square" />
      <div class="flex items-end justify-between">
        <USkeleton class="h-5 w-30" />
        <USkeleton class="h-4 w-9" />
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { categoryLabels } from '#shared/constants/work';

const props = withDefaults(
  defineProps<{
    work?: WorkItem | null;
  }>(),
  {
    work: null,
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
