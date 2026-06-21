export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return;

  const isAdminVerified = useState('isAdminVerified', () => false);
  if (isAdminVerified.value) return;

  try {
    await $fetch('/api/admin/check', {
      method: 'POST',
    });
    isAdminVerified.value = true;
    return;
  } catch (error) {
    const authErrorMessage = useState('authErrorMessage');
    authErrorMessage.value = getErrorMessage(error, '身分驗證失敗，請重新登入');
    return navigateTo('/admin/login');
  }
});
