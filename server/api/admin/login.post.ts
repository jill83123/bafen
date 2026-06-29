import { SignJWT } from 'jose';
import type { StringValue } from 'ms';
import ms from 'ms';
import { z } from 'zod';

type GoogleUserInfo = { email: string };

const BodySchema = z.object({
  token: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const { token } = await validateBody(event, BodySchema);

  // 驗證 Google Access Token
  const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (response) => (response.ok ? ((await response.json()) as GoogleUserInfo) : null))
    .catch(() => null);

  if (!userInfo) throw createError({ statusCode: 401, message: '無效的登入' });

  // 檢查是否為管理員
  const runtimeConfig = useRuntimeConfig();
  const {
    adminEmails: ADMIN_EMAILS,
    jwtSecret: JWT_SECRET,
    jwtExpTime: JWT_EXP_TIME,
  } = runtimeConfig;

  const adminEmailArray = ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase());
  const isAdmin = adminEmailArray.includes(userInfo.email.toLowerCase());
  if (!isAdmin) throw createError({ statusCode: 403, message: '您不是管理員' });

  // 產生 JWT Token
  const jwtPayload = { email: userInfo.email };
  const jwtExpSec = ms(JWT_EXP_TIME as StringValue) / 1000;
  const jwtExpDate = new Date(Date.now() + jwtExpSec * 1000);

  const jwtToken = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(jwtExpDate)
    .sign(new TextEncoder().encode(JWT_SECRET));

  setCookie(event, 'admin_token', jwtToken, {
    maxAge: jwtExpSec,
    expires: jwtExpDate,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return {};
});
