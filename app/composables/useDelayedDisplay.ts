export const useDelayedDisplay = (pendingRef: Ref<boolean>, delay = 150) => {
  const shouldShow = ref(true);

  const { start, stop } = useTimeoutFn(
    () => {
      shouldShow.value = true;
    },
    delay,
    {
      immediate: false,
    },
  );

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
