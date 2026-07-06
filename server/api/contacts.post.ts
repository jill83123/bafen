import { ContactFormSchema } from '#shared/schema';
import { db } from '@nuxthub/db';
import { contactTable } from '@nuxthub/db/schema';
import { z } from 'zod';

const BodySchema = ContactFormSchema.extend({
  recaptchaToken: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const contactData = await validateBody(event, BodySchema);

  // 先驗證 recaptcha
  const recaptchaSecret =
    process.env.NODE_ENV === 'production'
      ? process.env.NUXT_RECAPTCHA_SECRET
      : '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // 官方測試金鑰

  const verifyResponse = await $fetch<{ success: boolean; score: number }>(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      body: new URLSearchParams({
        secret: recaptchaSecret!,
        response: contactData.recaptchaToken,
      }),
    },
  );

  if (!verifyResponse.success || verifyResponse.score < 0.5) {
    throw createError({
      statusCode: 403,
      message: '驗證失敗，若您使用 VPN 或無痕模式，請關閉後再試',
    });
  }

  // 存入資料表
  await db.insert(contactTable).values(contactData);

  // 轉寄到信箱
  const runtimeConfig = useRuntimeConfig();
  const {
    isEmailSenderEnabled: IS_EMAIL_SENDER_ENABLED,
    googleClientSecret: GOOGLE_CLIENT_SECRET,
    senderGmailRefreshToken: SENDER_GMAIL_REFRESH_TOKEN,
    senderGmailAddress: SENDER_GMAIL_ADDRESS,
    receiverMailAddress: RECEIVER_MAIL_ADDRESS,
  } = runtimeConfig;
  const { googleClientId: GOOGLE_CLIENT_ID } = runtimeConfig.public;

  if (!IS_EMAIL_SENDER_ENABLED) {
    setResponseStatus(event, 204);
    return null;
  }

  const tokenResponse = await $fetch<{ access_token: string }>(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: SENDER_GMAIL_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }).toString(),
    },
  );

  const accessToken = tokenResponse.access_token;

  // 組 Gmail API 信件格式
  const emailContent = buildContactEmail({
    from: SENDER_GMAIL_ADDRESS,
    to: RECEIVER_MAIL_ADDRESS,
    data: contactData,
  });

  // 將信件轉為 Google 指定的安全 Base64 格式
  const encodedEmail = Buffer.from(emailContent)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // 打 GCP Gmail API 發信
  await $fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: { raw: encodedEmail },
  });

  setResponseStatus(event, 204);
  return null;
});
