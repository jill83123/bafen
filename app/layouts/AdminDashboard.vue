<template>
  <UDashboardGroup storage="local" storage-key="admin-dashboard" unit="px">
    <UDashboardSidebar
      v-model:open="isNavMenuOpen"
      mode="slideover"
      toggle-side="right"
      :default-size="300"
      collapsible
      :ui="{
        root: 'bg-canvas/30 min-w-17',
        header: 'border-default h-auto overflow-hidden border-b p-0 pr-6 sm:p-0 sm:pr-6 lg:p-0',
        body: 'p-0 sm:p-0',
        footer: 'p-0 sm:p-0',
        toggle: '-m-2',
        content: 'ring-default shadow-none! ring',
      }"
    >
      <template #header="{ collapsed, collapse }">
        <div
          v-if="!collapsed"
          class="flex w-full items-center justify-between gap-1 p-6 pr-0 lg:pr-6"
        >
          <div class="font-serif text-2xl leading-none font-medium">八分｜後台</div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-material-symbols-left-panel-close-outline-rounded"
            :ui="{
              base: 'text-ink/80 -m-2 hidden lg:flex',
              leadingIcon: 'size-6',
            }"
            @click="collapse(true)"
          />
        </div>

        <div v-else>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ri-menu-fill"
            :ui="{ base: 'px-6 py-6.5' }"
            @click="collapse(false)"
          />
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="navMenu[0]"
          orientation="vertical"
          :collapsed="collapsed"
          tooltip
        />
      </template>

      <template #footer="{ collapsed }">
        <UNavigationMenu
          :items="navMenu[1]"
          orientation="vertical"
          :collapsed="collapsed"
          tooltip
          :ui="{ root: 'w-full' }"
        />
      </template>
    </UDashboardSidebar>

    <div class="w-full overflow-y-scroll">
      <header
        class="border-default bg-default/75 sticky inset-x-0 top-0 z-10 border-b backdrop-blur"
      >
        <div class="container max-w-7xl">
          <UDashboardNavbar
            toggle-side="right"
            :ui="{
              root: 'h-auto border-0 px-3! py-6',
              toggle: '-m-2',
            }"
          >
            <template #left>
              <h1 class="font-serif text-2xl leading-none font-medium">
                {{ title }}
              </h1>
            </template>
          </UDashboardNavbar>
        </div>
      </header>

      <main class="container flex min-h-[calc(100vh-73px)] max-w-7xl flex-col p-6">
        <slot />
      </main>
    </div>
  </UDashboardGroup>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();
const router = useRouter();
const toast = useAppToast();

const isNavMenuOpen = defineModel<boolean>();

router.beforeEach(() => {
  isNavMenuOpen.value = false;
});

const navMenu: NavigationMenuItem[][] = [
  [
    {
      label: '資訊主頁',
      icon: 'i-material-symbols-dashboard-outline',
      to: '/admin/dashboard',
    },
    {
      label: '作品管理',
      icon: 'i-nrk-gallery',
      to: '/admin/dashboard/work',
    },
    {
      label: '聯絡紀錄',
      icon: 'i-material-symbols-mail-outline-sharp',
      to: '/admin/dashboard/contact',
    },
  ],
  [
    {
      label: '登出',
      icon: 'i-ri-logout-box-line',
      onSelect: () => handleLogout(),
    },
  ],
];

const title = computed(() => {
  const flatItems = navMenu.flat();
  const currentItem = flatItems.find((item) => item.to === route.path);
  return currentItem ? currentItem.label : '後台管理';
});

const handleLogout = async () => {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' });
    toast.success('登出成功');
    navigateTo('/');
  } catch (error) {
    toast.error(getErrorMessage(error, '登出失敗，請稍後再試'));
  }
};
</script>

<style scoped></style>
