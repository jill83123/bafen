<template>
  <UApp :toaster="{ position: 'top-right' }">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script lang="ts" setup>
useHead({
  htmlAttrs: {
    lang: 'zh-Hant-TW',
  },
  titleTemplate: (titleChunk) => {
    return `${titleChunk ? `${titleChunk}｜` : ''}八分室內裝修`;
  },
});
</script>
