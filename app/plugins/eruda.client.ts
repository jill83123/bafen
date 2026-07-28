export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'development') {
    import('eruda').then((eruda) => {
      eruda.default.init();
    });
  }
});
