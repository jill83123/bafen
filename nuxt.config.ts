import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  typescript: { typeCheck: true },

  modules: [
    '@nuxthub/core',
    'nuxt-security',
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
  icon: {
    size: '20px',
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
  vite: { plugins: [tailwindcss()] },
});
