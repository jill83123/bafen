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
    const adminAuthError = useState('adminAuthError');
    adminAuthError.value = error;
    return navigateTo('/admin/login');
  }
});
