import { jwtVerify } from 'jose';

export default defineEventHandler(async (event) => {
  const shouldVerifyPath = event.path.startsWith('/api/admin') && !event.path.includes('login');

  if (shouldVerifyPath) {
    const token = getCookie(event, 'admin_token');
    if (!token || token.trim() === '') throw createError({ statusCode: 400, message: '請先登入' });

    const runtimeConfig = useRuntimeConfig();
    const { jwtSecret: JWT_SECRET } = runtimeConfig;

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

      const isBlacklisted = !!(await kv.get(`blackToken:${token}`));
      if (isBlacklisted) throw createError({ statusCode: 403, message: '請重新登入' });

      event.context.admin = { token, ...payload };
    } catch {
      throw createError({ statusCode: 401, message: '請重新登入' });
    }
  }
});
