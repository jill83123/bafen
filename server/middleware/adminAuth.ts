import { jwtVerify } from 'jose';
import { z } from 'zod';

const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
export const JwtSchema = z.string().regex(jwtRegex);

const CookieSchema = z.object({ admin_token: JwtSchema });

export default defineEventHandler(async (event) => {
  const shouldVerifyPath = event.path.startsWith('/api/admin') && !event.path.includes('login');

  if (shouldVerifyPath) {
    const cookie = parseCookies(event);
    const cookieParseResult = CookieSchema.safeParse(cookie);
    if (!cookieParseResult.success) throw createError({ statusCode: 400, message: '請先登入' });

    const { admin_token: token } = cookieParseResult.data;

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
