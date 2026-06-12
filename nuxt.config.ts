import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: { typeCheck: true },

  modules: [
    '@nuxthub/core',
    'nuxt-security',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/image',
    '@vee-validate/nuxt',
    '@nuxt/scripts',
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/hints',
  ],
  hub: {
    blob: true,
    db: 'sqlite',
    kv: true,
  },
  security: {
    headers: {
      crossOriginOpenerPolicy: 'same-origin-allow-popups',
    },
  },
  icon: {
    size: '20px',
  },
  fonts: {
    families: [
      { name: 'Arimo', provider: 'google' },
      { name: 'Chiron Hei HK', provider: 'google' },
      { name: 'Noto Serif TC', provider: 'google' },
    ],
  },
  veeValidate: {
    autoImports: true,
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage',
    },
  },

  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@fancyapps/ui',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'browser-image-compression',
        'vue3-google-login',
        'zod',
      ],
    },
  },
  nitro: {
    routeRules: {
      '/admin/**': { ssr: false },
      '/admin/dashboard/**': { appLayout: 'admin-dashboard' },
      '/images/**': {
        security: {
          rateLimiter: {
            tokensPerInterval: 200,
            interval: '10s',
          },
        },
      },
    },
  },
  runtimeConfig: {
    adminEmails: process.env.NUXT_ADMIN_EMAILS, // 使用 ',' 分隔
    jwtSecret: process.env.NUXT_JWT_SECRET,
    jwtExpTime: process.env.NUXT_JWT_EXP_TIME, // ex: '1d', '12h', '30m'

    isEmailSenderEnabled: process.env.NUXT_IS_EMAIL_SENDER_ENABLED === 'true',
    googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    senderGmailAddress: process.env.NUXT_SENDER_GMAIL_ADDRESS,
    senderGmailRefreshToken: process.env.NUXT_SENDER_GMAIL_REFRESH_TOKEN,
    receiverMailAddress: process.env.NUXT_RECEIVER_MAIL_ADDRESS,

    public: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
  },
});
