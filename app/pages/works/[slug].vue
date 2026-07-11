<template>
  <div class="one-content-page">
    <!-- 資訊區塊 -->
    <div class="mb-15 flex flex-col items-center gap-3 sm:mb-20 lg:mb-25">
      <NuxtLink
        :to="{
          path: '/works',
          query: { category: data?.category },
        }"
        class="inline-block"
      >
        {{ data?.category && categoryLabels[data?.category] }}
      </NuxtLink>

      <h1 class="section-title text-brand-main">{{ data?.title }}</h1>

      <!-- 標籤 -->
      <ul class="flex justify-center gap-3 pt-2">
        <li v-for="tag in data?.tags" :key="tag.id" class="text-sub flex items-center gap-0.5">
          <Icon name="i-material-symbols-tag" />
          <span class="leading-none">{{ tag.name }}</span>
        </li>
      </ul>
    </div>

    <!-- 圖片 -->
    <div class="container hidden grid-cols-2 gap-2 sm:grid">
      <div class="flex flex-col gap-2">
        <div
          v-for="image in leftColumnImages"
          :key="image.id"
          role="button"
          @click="openPreview(image.id)"
        >
          <img :src="image.path" alt="作品照片" class="w-full" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div
          v-for="image in rightColumnImages"
          :key="image.id"
          role="button"
          @click="openPreview(image.id)"
        >
          <img :src="image.path" alt="作品照片" class="w-full" />
        </div>
      </div>
    </div>

    <!-- 手機版 -->
    <div class="container grid grid-cols-1 gap-2 sm:hidden">
      <div v-for="image in images" :key="image.id" role="button" @click="openPreview(image.id)">
        <img :src="image.path" alt="作品照片" class="w-full" />
      </div>
    </div>

    <div class="mt-6 flex justify-center sm:mt-8 lg:mt-10">
      <UButton label="回上一頁" color="neutral" variant="link" class="text-sm" @click="goBack" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { categoryLabels } from '#shared/constants/work';

const route = useRoute();
const router = useRouter();
const site = useSiteConfig();

const slug = route.params.slug;
const { data, error } = await useFetch(`/api/works/${slug}`);

useHead({
  title: () => data.value?.title,
});

useSeoMeta({
  ogImage: data.value?.cover.path,
  twitterImage: data.value?.cover.path,
});

useSchemaOrg([
  {
    '@type': 'CreativeWork',
    name: data.value?.title,
    genre: data.value?.category,
    image: data.value?.cover.path ? new URL(data.value.cover.path, site.url).href : undefined,
    dateCreated: data.value?.createdAt,
    dateModified: data.value?.updatedAt,
    creator: { '@type': 'Organization', name: site.name },
    inLanguage: 'zh-TW',
  },
  ...(data.value?.images.map((img) =>
    defineImage({
      url: new URL(img.path, site.url).href,
    }),
  ) ?? []),
]);

const images = computed(() => data.value?.images || []);
const leftColumnImages = computed(() => images.value.filter((_, i) => i % 2 === 0)); // 偶數 index：1、3、5...
const rightColumnImages = computed(() => images.value.filter((_, i) => i % 2 === 1)); // 奇數 index：2、4、6...

useErrorToast([error]);

// 燈箱
const { openLightbox } = useLightbox();

const openPreview = (imageId: string) => {
  const index = images.value.findIndex((image) => image.id === imageId);
  const slides = images.value.map((item) => ({ src: item.path }));
  openLightbox({ slides, index });
};

const goBack = () => {
  router.back();
};
</script>

<style scoped></style>
