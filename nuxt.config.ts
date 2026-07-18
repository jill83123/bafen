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
    '@nuxt/scripts',
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
  ],
  hub: {
    blob: true,
    db: 'sqlite',
    kv: true,
  },
  security: {
    headers: {
      crossOriginOpenerPolicy: 'same-origin-allow-popups',
      crossOriginEmbedderPolicy: false,
    },
  },
  ui: {
    experimental: { componentDetection: true },
    fonts: false,
  },
  icon: {
    size: '20px',
    clientBundle: { scan: true },
    customCollections: [{ prefix: 'custom', dir: './app/assets/icons' }],
  },
  a11y: {
    axe: {
      options: {
        rules: [{ id: 'color-contrast', enabled: false }],
      },
      runOptions: {},
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: process.env.NUXT_PUBLIC_SITE_NAME,
    description: process.env.NUXT_PUBLIC_SITE_DESCRIPTION,
    indexable: process.env.NUXT_PUBLIC_SITE_ENV === 'production',
  },
  robots: {
    disallow: '/admin/',
  },
  sitemap: {
    exclude: ['/admin/**'],
    sources: ['/api/__sitemap__/urls'],
    autoLastmod: true,
  },

  css: ['./app/assets/css/main.css'],
  colorMode: { preference: 'light' }, // TODO: 深色模式

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      ],
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@unhead/schema-org/vue',
        '@unovis/vue',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/integrations',
        '@vueuse/integrations/useSortable',
        'browser-image-compression',
        'gsap',
        'gsap/ScrollTrigger',
        'photoswipe',
        'photoswipe/lightbox',
        'swiper/modules',
        'swiper/vue',
        'vue3-google-login',
        'zod',
      ],
    },
  },
  nitro: {
    routeRules: {
      '/admin/**': {
        ssr: false,
        appMiddleware: ['admin-auth'],
        appLayout: false,
        robots: false,
      },
      '/admin/dashboard/**': {
        appLayout: 'admin-dashboard',
      },
      '/images/**': {
        security: {
          rateLimiter: {
            tokensPerInterval: 100,
            interval: 10000, // 10s
          },
        },
      },
      '/api/contacts': {
        security: {
          rateLimiter: {
            tokensPerInterval: 10,
            interval: 600000, // 10m
            headers: true,
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
    senderGmailAddress: process.env.NUXT_SENDER_GMAIL_ADDRESS,
    senderGmailRefreshToken: process.env.NUXT_SENDER_GMAIL_REFRESH_TOKEN,
    receiverMailAddress: process.env.NUXT_RECEIVER_MAIL_ADDRESS,

    googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    recaptchaSecret: process.env.NUXT_RECAPTCHA_SECRET,

    gaClientEmail: process.env.NUXT_GA_CLIENT_EMAIL,
    gaPrivateKey: process.env.NUXT_GA_PRIVATE_KEY,
    gaPropertyId: process.env.NUXT_GA_PROPERTY_ID, // 資源 ID

    public: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY,
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID,
    },
  },
});
