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

const encodeMimeHeader = (value: string) => `=?utf-8?B?${Buffer.from(value).toString('base64')}?=`;

const buildContactEmailTextBody = (data: ContactForm) => {
  return (
    `以下是透過官網送出的資料：${CRLF}${CRLF}` +
    `姓名：${data.name}${CRLF}` +
    `Email：${data.email}${CRLF}` +
    `電話：${data.tel}${CRLF}` +
    `地址：${data.address}${CRLF}` +
    `需求內容：${data.content}${CRLF}`
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
    .map(
      ({ label, value }) => `
        <tr>
          <th style="padding: 12px 28px 12px 0; font-weight: bold; white-space: nowrap; vertical-align: top;">${label}</th>
          <td style="padding: 12px 0;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('');

  return `
  <!doctype html>
  <html lang="zh-Hant">
    <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; font-size: 14.5px; margin: 14px 0 28px 0;">
      <p style="margin: 0 0 12px;">以下是透過官網送出的資料：</p>
      <div style="border-left: 6px #CC9E25 solid;">
        <div style="max-width: 600px; border: 1px #ddd solid; border-left: 0; padding: 12px 24px;">
          <table style="border-collapse: collapse; text-align: left; color: #272624;">
            ${fieldRows}
          </table>
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
