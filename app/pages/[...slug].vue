<template>
  <div class="flex min-h-[calc(100dvh-68px)] flex-col items-center justify-center gap-3">
    <div class="section-title">404</div>
    <h1>您所要訪問的頁面不存在</h1>
    <UButton label="回首頁" size="sm" to="/" />
  </div>
</template>

<script lang="ts" setup>
useHead({
  title: '404',
});

const event = useRequestEvent();
if (event) setResponseStatus(event, 404);
</script>

<style scoped></style>
