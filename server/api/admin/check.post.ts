export default defineEventHandler(async (event) => {
  // 由 middleware 處理驗證
  setResponseStatus(event, 204);
  return null;
});
