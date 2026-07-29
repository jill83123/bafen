import type { ContactForm } from '#shared/schema';

type BuildContactEmailParams = {
  from: string;
  to: string;
  data: ContactForm;
};

const CRLF = '\r\n';

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatHtmlValue = (value: string) => {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
};

const encodeMimeHeader = (value: string) => `=?utf-8?B?${Buffer.from(value).toString('base64')}?=`;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', 'Helvetica Neue', Arial, sans-serif";

const buildContactEmailTextBody = (data: ContactForm) => {
  return (
    `姓名：${data.name}${CRLF}` +
    `Email：${data.email}${CRLF}` +
    `電話：${data.tel}${CRLF}` +
    `地址：${data.address}${CRLF}` +
    `需求內容：${data.content}${CRLF}${CRLF}` +
    `---${CRLF}` +
    `此信件由官網聯絡表單自動發送`
  );
};

const buildContactEmailHtmlBody = (data: ContactForm) => {
  const fields = [
    { label: '姓名', value: data.name },
    { label: 'EMAIL', value: data.email },
    { label: '電話', value: data.tel },
    { label: '地址', value: data.address },
    { label: '需求內容', value: data.content },
  ];

  const fieldRows = fields
    .map(({ label, value }, index) => {
      const isLast = index === fields.length - 1;
      const borderStyle = isLast ? '' : 'border-bottom: 1px solid #f0f0f0;';

      return `
        <tr>
          <th style="padding: 16px 20px 16px 0; ${borderStyle} font-weight: 500; font-size: 13px; letter-spacing: 0.05em; color: #737373; text-transform: uppercase; white-space: nowrap; vertical-align: top; text-align: left; width: 90px;">${label}</th>
          <td style="padding: 16px 0; ${borderStyle} color: #262626; font-size: 14.5px; font-weight: 400; vertical-align: top; word-break: break-word; line-height: 1.65;">${formatHtmlValue(value)}</td>
        </tr>`;
    })
    .join('');

  return `
  <!doctype html>
  <html lang="zh-Hant">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: ${FONT_STACK}; line-height: 1.65; font-size: 14.5px; margin: 0; padding: 48px 16px; background-color: #f7f7f8; color: #262626; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 560px; margin: 0 auto;">
        <!-- 主體卡片 -->
        <div style="background-color: #ffffff; border: 1px solid #e5e5e5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);">
          <!-- 頂部飾條 -->
          <div style="height: 3px; background-color: #71717a; width: 100%;"></div>

          <div style="padding: 12px 32px 16px 32px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              ${fieldRows}
            </table>
          </div>
        </div>

        <!-- 頁尾文字 -->
        <div style="text-align: center; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #999999; letter-spacing: 0.03em;">此信件由官網聯絡表單自動發送</p>
        </div>
      </div>
    </body>
  </html>`;
};

const CONTACT_EMAIL_FROM_NAME = '八分官網';
const CONTACT_EMAIL_SUBJECT = '官網收到了新的聯絡！';
const CONTACT_EMAIL_BOUNDARY = 'contact-form-boundary';

export const buildContactEmail = ({ from, to, data }: BuildContactEmailParams) => {
  const encodedFromName = encodeMimeHeader(CONTACT_EMAIL_FROM_NAME);
  const textBody = buildContactEmailTextBody(data);
  const htmlBody = buildContactEmailHtmlBody(data);

  return (
    `From: ${encodedFromName} <${from}>${CRLF}` +
    `To: <${to}>${CRLF}` +
    `Subject: ${encodeMimeHeader(CONTACT_EMAIL_SUBJECT)}${CRLF}` +
    `MIME-Version: 1.0${CRLF}` +
    `Content-Type: multipart/alternative; boundary="${CONTACT_EMAIL_BOUNDARY}"${CRLF}${CRLF}` +
    `--${CONTACT_EMAIL_BOUNDARY}${CRLF}` +
    `Content-Type: text/plain; charset=UTF-8${CRLF}${CRLF}` +
    `${textBody}${CRLF}${CRLF}` +
    `--${CONTACT_EMAIL_BOUNDARY}${CRLF}` +
    `Content-Type: text/html; charset=UTF-8${CRLF}${CRLF}` +
    `${htmlBody}${CRLF}${CRLF}` +
    `--${CONTACT_EMAIL_BOUNDARY}--`
  );
};
