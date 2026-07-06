export default defineEventHandler(async (event) => {
  const { admin } = event.context;

  deleteCookie(event, 'admin_token', { path: '/' });

  // 把 Token 加入 KV 黑名單，並設定 TTL 自動過期
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const timeLeft = admin.exp - nowInSeconds;
  if (timeLeft > 0) await kv.set(`blackToken:${admin.token}`, 'logout_revoked', { ttl: timeLeft });

  setResponseStatus(event, 204);
  return null;
});
