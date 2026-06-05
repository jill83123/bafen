import { z } from 'zod';

// 09xx-xxx-xxx 或 09xxxxxxxx 或 0x-xxxxxxx 或 0xx-xxxxxxx
const telRegex = /^(09\d{2}-\d{3}-\d{3}|09\d{8}|0\d{1,2}-?\d{7,8})$/;

// 需包含一個字眼
const addressRegex = /^.*[縣市區鄉鎮路街巷弄].*$/;

export const ContactFormSchema = z.object({
  name: z.string().trim().min(2, '姓名最少需要 2 個字'),
  email: z.email('請輸入有效的電子郵件地址'),
  tel: z.string().regex(telRegex, '電話格式不正確，例如：09xx-xxx-xxx、0x-xxxxxxxx'),
  address: z.string().regex(addressRegex, '地址格式不正確，例如：xx市xx區xx路'),
  content: z.string().trim().min(1, '需求內容為必填欄位'),
});

export type ContactForm = z.infer<typeof ContactFormSchema>;
