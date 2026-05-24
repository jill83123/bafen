// @ts-check
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    ignores: ['server/api/**'],
    rules: {
      'no-console': 'warn',
    },
  },
);
