export const useRecaptcha = () => {
  const config = useRuntimeConfig();

  const siteKey =
    process.env.NODE_ENV === 'production'
      ? config.public.recaptchaSiteKey
      : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // 官方測試金鑰

  const { load, onLoaded } = useScriptGoogleRecaptcha({
    siteKey,
    scriptOptions: { trigger: 'manual' }, // 保留延遲載入，避免拖累首頁效能
  });

  const execute = (action: string): Promise<string | undefined> => {
    return new Promise((resolve) => {
      onLoaded(({ grecaptcha }) => {
        // 官方 script 內部初始化是非同步的，ready() 確保 execute 真的可用
        grecaptcha.ready(async () => {
          try {
            const token = await grecaptcha.execute(siteKey, { action });
            resolve(token);
          } catch (err) {
            resolve(undefined);
          }
        });
      });

      load(); // 觸發真正的 script 下載，onLoaded 的 callback 才會被呼叫
    });
  };

  return {
    execute,
  };
};
