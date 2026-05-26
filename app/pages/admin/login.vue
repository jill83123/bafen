<template>
  <div>
    <button type="button" class="flex items-center" @click="handleLogin">
      <Icon name="material-icon-theme:google" />使用 Google 繼續
    </button>
  </div>
</template>

<script lang="ts" setup>
import { googleTokenLogin } from 'vue3-google-login';
import { FetchError } from 'ofetch';

const runtimeConfig = useRuntimeConfig();
const { googleClientId: GOOGLE_CLIENT_ID } = runtimeConfig.public;

const toast = useAppToast();

const handleLogin = async () => {
  const accessToken = await googleTokenLogin({ clientId: GOOGLE_CLIENT_ID })
    .then((response) => response.access_token)
    .catch((error) => {
      if (!error.type?.includes('popup_closed')) toast.error('Google 登入失敗');
      return null;
    });

  if (!accessToken) return;

  try {
    const result = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { token: accessToken },
    });
    toast.success(result.message || '登入成功');
    navigateTo('/admin', { replace: true });
  } catch (error) {
    toast.error(getErrorMessage(error, '登入失敗'));
    if (error instanceof FetchError && error.status === 403) navigateTo('/', { replace: true });
  }
};
</script>

<style scoped></style>
