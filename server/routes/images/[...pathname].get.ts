export default eventHandler(async (event) => {
  const { pathname } = getRouterParams(event);
  const ext = pathname?.split('.').pop();

  setHeader(event, 'Content-Type', `image/${ext}`);
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
  setHeader(event, 'Content-Security-Policy', "default-src 'none';");

  return await blob.serve(event, `images/${pathname}`);
});
