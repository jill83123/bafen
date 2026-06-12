/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 100,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  plugins: [
    'prettier-plugin-tailwindcss', // MUST come last
  ],
  tailwindAttributes: ['ui'],
  tailwindFunctions: ['tw'],
};

export default config;
