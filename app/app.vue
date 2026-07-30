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
  meta: [
    {
      name: 'keywords',
      content: '八分,室內設計,住宅設計,室內裝修,空間規劃,裝修設計,居家設計,客製化設計',
    },
  ],
});

useSeoMeta({
  title: site.name,
  description: site.description,

  ogUrl: site.url,
  ogTitle: site.name,
  ogDescription: site.description,
  ogImage: ogImage,

  twitterCard: 'summary_large_image',
  twitterTitle: site.name,
  twitterDescription: site.description,
  twitterImage: ogImage,
});

useSchemaOrg([
  defineLocalBusiness({
    type: ['InteriorDesign', 'GeneralContractor'],

    // Basic Information
    name: site.name,
    description: site.description,
    url: site.url,
    image: ogImage,
    telephone: '+886-4-2565-2603',
    email: 'chun.sin999@gmail.com',

    // Location
    address: {
      streetAddress: '前村路 382 巷 40 之 1 號',
      addressLocality: '大雅區',
      addressRegion: '台中市',
      postalCode: '428',
      addressCountry: 'TW',
    },
    geo: {
      latitude: '24.223',
      longitude: '120.662',
    },
    areaServed: ['台中市', '大雅區'],
  }),
]);
</script>
