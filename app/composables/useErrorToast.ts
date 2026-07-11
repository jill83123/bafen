export const useErrorToast = (
  errors: Ref<unknown>[],
  fallbackMessage = '資料取得失敗，請稍後再試',
) => {
  const toast = useAppToast();

  watch(errors, (newErrors) => {
    const err = newErrors.find((e) => e !== null);
    if (err) toast.error(getErrorMessage(err, fallbackMessage));
  });
};
