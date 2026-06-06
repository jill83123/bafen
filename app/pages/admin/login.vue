<template>
  <main class="h-screen">
    <div class="flex h-full flex-col items-center justify-center p-3">
      <UPageCard class="w-full max-w-md p-1">
        <UAuthForm
          icon="i-ri-admin-line"
          title="八分｜後台登入"
          :providers="providers"
          :ui="{ title: 'font-serif text-2xl font-medium' }"
        >
          <template #footer>
            <NuxtLink to="/" class="text-brand-main hover:text-brand-hover -my-2 p-2 font-medium">
              回首頁
            </NuxtLink>
          </template>
        </UAuthForm>
      </UPageCard>

      <p v-show="errorMessage" class="text-error mt-7 flex items-center gap-1">
        <Icon name="i-material-symbols-error-outline" />{{ errorMessage }}
      </p>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { googleTokenLogin } from 'vue3-google-login';
import type { ButtonProps } from '@nuxt/ui';

const runtimeConfig = useRuntimeConfig();
const { googleClientId: GOOGLE_CLIENT_ID } = runtimeConfig.public;

const toast = useAppToast();

const providers = ref<ButtonProps[]>([
  {
    label: '使用 Google 繼續',
    icon: 'material-icon-theme:google',
    color: 'neutral',
    variant: 'soft',
    ui: { base: 'gap-2' },
    onClick: () => {
      handleLogin();
    },
  },
]);

const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';

  const accessToken = await googleTokenLogin({ clientId: GOOGLE_CLIENT_ID })
    .then((response) => response.access_token)
    .catch((error) => {
      const isPopupClosed = error.type?.includes('popup_closed');
      if (!isPopupClosed) toast.error('Google 登入失敗，請稍後再試');
      return null;
    });

  if (!accessToken) return;

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { token: accessToken },
    });
    toast.success('登入成功');
    navigateTo('/admin', { replace: true });
  } catch (error) {
    errorMessage.value = getErrorMessage(error, '登入失敗，請稍後再試');
  }
};
</script>

<style scoped></style>
