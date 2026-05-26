export default defineEventHandler(async () => {
  // 由 middleware 處理驗證
  return { message: '驗證成功' };
});
