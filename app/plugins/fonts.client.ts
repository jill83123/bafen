const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&family=Chiron+Hei+HK:ital,wght@0,400..700;1,400..700&family=Noto+Serif+TC:wght@400..600&display=swap';

export default defineNuxtPlugin(() => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = GOOGLE_FONTS_URL;
  link.media = 'print';
  link.addEventListener('load', () => (link.media = 'all'));
  document.head.appendChild(link);
});
