import { contactTable } from '#server/db/schema';
import { ContactFormSchema } from '#shared/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bodyParseResult = ContactFormSchema.safeParse(body);
  if (!bodyParseResult.success) throw createError({ statusCode: 400 });

  const contactData = bodyParseResult.data;

  // 存入資料表
  await db.insert(contactTable).values(contactData);

  // 轉寄到信箱
  const runtimeConfig = useRuntimeConfig();
  const {
    googleClientSecret: GOOGLE_CLIENT_SECRET,
    senderGmailRefreshToken: SENDER_GMAIL_REFRESH_TOKEN,
    senderGmailAddress: SENDER_GMAIL_ADDRESS,
    receiverMailAddress: RECEIVER_MAIL_ADDRESS,
  } = runtimeConfig;
  const { googleClientId: GOOGLE_CLIENT_ID } = runtimeConfig.public;

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

  return {};
});
