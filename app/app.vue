<template>
  <NuxtLoadingIndicator color="var(--color-primary-300)" />
  <UApp :toaster="{ position: 'top-right' }">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script lang="ts" setup>
import ogImage from '@/assets/images/index/header_1.webp';

const site = useSiteConfig();
const { getPageTitle } = usePageTitle();

useHead({
  htmlAttrs: {
    lang: 'zh-Hant-TW',
  },
  titleTemplate: (titleChunk) => getPageTitle(titleChunk),
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
});

useSeoMeta({
  title: site.name,
  description: site.description,
  keywords: '八分,室內設計,住宅設計,室內裝修,空間規劃,裝修設計,居家設計,客製化設計',

  ogUrl: site.url,
  ogTitle: site.name,
  ogDescription: site.description,
  ogImage: ogImage,

  twitterCard: 'summary_large_image',
  twitterTitle: site.name,
  twitterDescription: site.description,
  twitterImage: ogImage,
});
</script>
