export const useDelayedDisplay = (pendingRef: Ref<boolean>, delay = 150) => {
  const shouldShow = ref(false);

  const { start, stop } = useTimeoutFn(
    () => {
      shouldShow.value = true;
    },
    delay,
    {
      immediate: false,
    },
  );

  // 避免載入在 setup 之前開始，導致下方的 watch 沒有觸發
  if (pendingRef?.value) start();

  watch(pendingRef, (isPending) => {
    if (isPending) {
      start();
    } else {
      stop();
      shouldShow.value = false;
    }
  });

  return shouldShow;
};
