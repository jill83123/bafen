<template>
  <div class="overflow-hidden">
    <header class="relative h-70 sm:h-80 lg:h-90">
      <!-- 背景圖片 -->
      <div
        class="absolute inset-0 -z-2 scale-x-[-1] bg-cover bg-center"
        :style="{ backgroundImage: `url(${contactImage})` }"
      />

      <!-- 漸層遮罩 -->
      <div
        class="absolute inset-0 -z-1"
        style="
          background-image:
            linear-gradient(to right, white 0%, white 30%, transparent 50%),
            linear-gradient(to top, white 0%, transparent 100%),
            linear-gradient(to left, rgba(39, 38, 36, 0.3) 0%, transparent 50%);
        "
      />

      <!-- 標題 -->
      <div class="absolute inset-0 container grid grid-cols-12 gap-6">
        <div
          class="page-title-fade-in col-span-full flex flex-col justify-center gap-6 lg:col-span-11 lg:col-start-2"
        >
          <div>
            <div class="section-overline">CONTACT</div>
            <h1 class="section-title">聯絡我們</h1>
          </div>

          <p class="text-base lg:text-lg">
            若您有新成屋規劃、老屋翻新、商辦空間設計、油漆工程...等需求，<br
              class="hidden sm:block"
            />歡迎聯繫與我們合作！
          </p>
        </div>
      </div>
    </header>

    <!-- 主要內容 -->
    <div class="one-content-page container grid grid-cols-12 gap-x-6 gap-y-12 pt-3!">
      <!-- 聯絡資訊 -->
      <div class="order-2 col-span-full md:order-1 md:col-span-6 lg:col-span-5 lg:col-start-2">
        <ul class="space-y-10 sm:space-y-14 lg:space-y-18">
          <li v-for="info in infos" :key="info.label">
            <h2 class="text-sub mb-1 font-medium">{{ info.label }}</h2>

            <div class="text-lg lg:text-xl">
              <template v-if="info.label === 'EMAIL'">
                <a :href="`mailto:${info.value}`">{{ info.value }}</a>
              </template>

              <template v-if="info.label === '電話'">
                <a :href="`tel:+${info.value}`">{{ info.value }}</a>
              </template>

              <template v-if="info.label === '地址'">
                <address class="not-italic">{{ info.value }}</address>
              </template>

              <template v-if="info.label === '社群平台' && Array.isArray(info.value)">
                <ul>
                  <li v-for="social in info.value" :key="social.href" class="flex gap-3">
                    <a :href="social.href" target="_blank" :title="social.title">
                      <Icon :name="social.icon" size="24" />
                    </a>
                  </li>
                </ul>
              </template>
            </div>
          </li>
        </ul>
      </div>

      <!-- 聯絡表單 -->
      <div class="order-1 col-span-full md:order-2 md:col-span-6 lg:col-span-5">
        <UForm
          ref="form"
          :schema="ContactFormSchema"
          :state="formState"
          name="contact"
          :ui="{
            base: 'space-y-5 lg:space-y-8',
          }"
          @submit="onSubmit"
        >
          <UFormField name="name" label="姓名" required>
            <UInput v-model="formState.name" placeholder="請輸入您的姓名" autocomplete="name" />
          </UFormField>

          <UFormField name="email" label="Email" required>
            <UInput
              v-model="formState.email"
              type="email"
              placeholder="請輸入您的 Email"
              autocomplete="email"
            />
          </UFormField>

          <UFormField name="tel" label="電話" required>
            <UInput
              v-model="formState.tel"
              type="tel"
              placeholder="請輸入市話或手機號碼"
              autocomplete="tel"
            />
          </UFormField>

          <UFormField name="address" label="地址" required>
            <UInput
              v-model="formState.address"
              placeholder="請輸入地址"
              autocomplete="address-line1"
            />
          </UFormField>

          <UFormField name="content" label="需求內容" required>
            <!-- UTextarea 這個元件有水合錯誤 (value 屬性)，但不影響使用 -->
            <UTextarea v-model="formState.content" placeholder="請描述您的需求或想法" :rows="5" />
          </UFormField>

          <UButton
            label="確認送出"
            color="primary"
            variant="solid"
            :loading="isSubmitting"
            class="w-full justify-center"
            @click="form?.submit()"
          />
        </UForm>

        <div class="text-sub mt-4 text-sm">本網站表單受到 Google reCAPTCHA 保護。</div>
      </div>
    </div>

    <!-- 送出成功 Modal -->
    <UModal
      v-model:open="isSuccessOpen"
      title="送出成功"
      :dismissible="false"
      :ui="{ content: 'max-w-90' }"
    >
      <template #body>
        <p>表單已送出，我們會盡快與您聯繫，謝謝！</p>
      </template>

      <template #footer>
        <UButton
          label="確認"
          color="primary"
          variant="solid"
          size="sm"
          class="ml-auto"
          @click="
            () => {
              isSuccessOpen = false;
            }
          "
        />
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { ContactForm } from '#shared/schema';
import { ContactFormSchema } from '#shared/schema';
import contactImage from '@/assets/images/contact_bg.webp';
import { FetchError } from 'ofetch';

useHead({
  title: '聯絡我們',
});

const toast = useAppToast();

const infos = [
  { label: 'EMAIL', value: 'chun.sin999@gmail.com' },
  { label: '電話', value: '04-2565-2603' },
  { label: '地址', value: '台中市大雅區前村路 382 巷 40 之 1 號' },
  {
    label: '社群平台',
    value: [
      {
        title: 'Facebook',
        icon: 'i-ri-facebook-box-fill',
        href: 'https://www.facebook.com/profile.php?id=61570960919834',
      },
    ],
  },
];

// =============== 表單相關 ===============
const form = useTemplateRef('form');
const isSubmitting = ref(false);
const isSuccessOpen = ref(false);

const createInitialFormState = (): ContactForm => ({
  name: '',
  email: '',
  tel: '',
  address: '',
  content: '',
});

const formState = ref<ContactForm>(createInitialFormState());

const resetForm = () => {
  form.value?.clear();
  formState.value = createInitialFormState();
};

const { execute: executeRecaptcha } = useRecaptcha();

const onSubmit = async (event: { data: ContactForm }) => {
  isSubmitting.value = true;

  try {
    const token = await executeRecaptcha('contact_form');

    if (!token) {
      toast.error('表單送出失敗，若您使用 VPN 或無痕模式，請關閉後再試');
      return;
    }

    await $fetch('/api/contacts', {
      method: 'POST',
      body: {
        ...event.data,
        recaptchaToken: token,
      },
    });

    isSuccessOpen.value = true;
    resetForm();
  } catch (error) {
    if (error instanceof FetchError && error.statusCode === 429) {
      toast.error('操作太過頻繁，請稍後再試');
      return;
    }
    toast.error(getErrorMessage(error, '表單送出失敗，請稍後再試'));
  } finally {
    isSubmitting.value = false;
  }
};

// 淡入效果
const { fadeIn } = useFadeIn();
fadeIn('.page-title-fade-in', {
  direction: 'left',
  immediate: true,
});
</script>

<style scoped></style>
