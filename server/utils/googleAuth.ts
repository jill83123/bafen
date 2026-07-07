import { SignJWT, importPKCS8 } from 'jose';

/**
 * 使用 Google 服務帳號（Service Account）憑證獲取 Google API 的 Access Token。
 * 透過 RS256 演算法簽署 JWT，並向 Google OAuth2 服務交換權限憑證。
 *
 * @param {string} clientEmail - Google 服務帳號的 Email（通常格式為：xxx@xxx.iam.gserviceaccount.com）
 * @param {string} privateKeyPem - 服務帳號的私鑰，必須是 PEM 格式（包含 -----BEGIN PRIVATE KEY-----）
 * @param {string} scope - 請求的權限範圍，多個權限請用空格分隔（例如："https://www.googleapis.com/auth/drive"）
 * @returns {Promise<string | null>} 回傳一個 Promise，解析後為可用於呼叫 Google API 的 access_token，若失敗則回傳 null
 */
export const getGoogleAccessToken = async (
  clientEmail: string,
  privateKeyPem: string,
  scope: string,
): Promise<string | null> => {
  try {
    const privateKey = await importPKCS8(privateKeyPem, 'RS256');
    const now = Math.floor(Date.now() / 1000);

    const jwt = await new SignJWT({ scope })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .setIssuer(clientEmail)
      .setAudience('https://oauth2.googleapis.com/token')
      .sign(privateKey);

    const response = await $fetch<{ access_token: string }>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    return response.access_token;
  } catch (error) {
    console.error('取得 Google Token 失敗：', error);
    return null;
  }
};
