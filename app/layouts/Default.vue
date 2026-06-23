<template>
  <div>
    <!-- header -->
    <header>
      <!-- 導覽列 -->
      <UHeader
        as="div"
        mode="slideover"
        :ui="{
          root: 'border-sub h-auto',
          container: 'max-w-[auto] pr-0! pl-3!',
          title: 'flex items-end gap-1 font-serif font-normal',
          toggle: 'border-sub m-0 border-l p-6 lg:hidden',
          content:
            'bg-ink/90 w-full max-w-full data-[state=closed]:animate-[slide-fade-out-to-right_300ms_ease-in-out] data-[state=open]:animate-[slide-fade-in-from-right_300ms_ease-in-out] lg:hidden',
          header: 'hidden',
        }"
      >
        <template #title>
          <span class="text-3xl">八分</span>
          <span class="text-sm">室內裝修</span>
        </template>

        <!-- 電腦版選單 -->
        <template #right>
          <UNavigationMenu
            :items="navMenu"
            :ui="{
              root: 'hidden lg:flex',
              item: 'p-0',
              link: 'data-active:text-brand-main leading-5 before:inset-0',
            }"
          />
        </template>

        <!-- 手機版選單 -->
        <template #content="{ close }">
          <div class="flex h-full flex-col gap-6">
            <div class="flex">
              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-x"
                class="ml-auto bg-white p-6"
                @click="close"
              />
            </div>

            <UNavigationMenu
              v-model:open="isNavMenuOpen"
              :items="navMenu"
              orientation="vertical"
              :ui="{
                root: 'grow overflow-y-scroll px-6',
                list: 'flex w-full flex-col gap-4',
                link: 'data-active:text-brand-main text-white',
              }"
            />
          </div>
        </template>
      </UHeader>

      <!-- header 其他要插入的內容 -->
      <component :is="headerComponent" v-if="headerComponent" />
    </header>

    <!-- 頁面內容 -->
    <main>
      <slot />
    </main>

    <!-- footer -->
    <footer>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3638.525943403412!2d120.662618!3d24.2233771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346916e3a9d62211%3A0x136f1962debd5e45!2zNDI46Ie65Lit5biC5aSn6ZuF5Y2A5aSn5qWT6YeM5YmN5p2R6LevMzgy5be3NDDkuYsx6Jmf!5e0!3m2!1szh-TW!2stw!4v1781858122661!5m2!1szh-TW!2stw"
        height="400"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="w-full"
      />

      <div class="bg-ink border-brand-main border-t-4 px-3 py-11">
        <ul
          class="mb-4 flex flex-col justify-center gap-y-1 text-sm text-white sm:flex-row sm:items-center"
        >
          <li class="flex items-center gap-2">
            <Icon name="i-material-symbols-mail-outline-sharp" size="18" class="text-white/80" />
            <a href="mailto:chun.sin999@gmail.com" class="hover:text-white/80">
              chun.sin999@gmail.com
            </a>
            <span class="hidden px-1 sm:inline">｜</span>
          </li>
          <li class="flex items-center gap-2">
            <Icon name="i-ic-outline-phone" size="18" class="text-white/80" />
            <a href="tel:+04-2565-2603" class="hover:text-white/80">04-2565-2603</a>
            <span class="hidden px-1 sm:inline">｜</span>
          </li>
          <li class="flex items-center gap-2">
            <Icon name="i-icon-park-outline-local-two" size="18" class="text-white/80" />
            <address class="not-italic">台中市大雅區前村路 382 巷 40 之 1 號</address>
          </li>
        </ul>

        <div class="text-sub text-xs sm:text-center">
          Copyright © 2026 八分室內裝修有限公司 All Rights Reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui';

const route = useRoute();
const router = useRouter();

// 導覽列
const isNavMenuOpen = defineModel<boolean>();

router.beforeEach(() => {
  isNavMenuOpen.value = false;
});

const navMenu = computed<NavigationMenuItem[]>(() => [
  {
    label: '作品展示',
    to: '/works',
  },
  {
    label: '關於我們',
    to: {
      path: '/',
      hash: '#about',
    },
    active: route.hash === '#about',
  },
  {
    label: '服務項目',
    to: {
      path: '/',
      hash: '#services',
    },
    active: route.hash === '#services',
  },
  {
    label: '服務流程',
    to: {
      path: '/',
      hash: '#process',
    },
    active: route.hash === '#process',
  },
  {
    label: '聯絡我們',
    icon: 'i-material-symbols-mail-outline-sharp',
    to: '/contact',
    ui: {
      link: tw`lg:bg-brand-main hover:lg:bg-brand-hover data-active:text-brand-main border-default data-active:border-brand-main data-active:lg:border-sub mt-4 border text-white before:inset-y-0 data-active:bg-transparent lg:mt-0 lg:border-0 lg:border-l lg:border-transparent hover:lg:text-white`,
      linkLeadingIcon: tw`text-inherit`,
    },
  },
]);

// header 其他要插入的內容
const headerModules = import.meta.glob<{ default: Component }>('@/components/*Header.vue', {
  eager: true,
});

const headerComponentMap: Record<string, Component> = Object.fromEntries(
  Object.entries(headerModules).map(([path, module]) => {
    const fileName = path.split('/').pop()?.replace('.vue', '') ?? ''; // e.g. 'IndexHeader'
    const key = fileName.replace(/Header$/, ''); // 'Index'
    const routeKey = key.charAt(0).toLowerCase() + key.slice(1); // 'index'
    return [routeKey, module.default];
  }),
);

const headerComponent = computed(() => {
  const key = route.name as string | undefined;
  return key ? headerComponentMap[key] : null;
});
</script>

<style scoped></style>
