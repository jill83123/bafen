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
  title: '八分室內裝修', // TODO: 需再調整
});
</script>
