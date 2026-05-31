<template>
  <div>
    <button type="button" @click="handleLogout">登出</button>
    <ImageUpload />
  </div>
</template>

<script lang="ts" setup>
const toast = useAppToast();

const handleLogout = async () => {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' });
    toast.success('登出成功');
    navigateTo('/');
  } catch (error) {
    toast.error(getErrorMessage(error, '登出失敗'));
  }
};
</script>

<style scoped></style>
