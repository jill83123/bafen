import type { ToastProps } from '@nuxt/ui';

type ToastType = 'success' | 'info' | 'warning' | 'error';
type ToastPayload = string | Omit<ToastProps, 'color'>;

export const useAppToast = () => {
  const toast = useToast();

  const showToast = (type: ToastType, payload: ToastPayload) => {
    if (typeof payload === 'string') {
      toast.add({ color: type, title: payload });
    } else {
      toast.add({ color: type, ...payload });
    }
  };

  const success = (payload: ToastPayload) => showToast('success', payload);
  const info = (payload: ToastPayload) => showToast('info', payload);
  const warning = (payload: ToastPayload) => showToast('warning', payload);
  const error = (payload: ToastPayload) => showToast('error', payload);

  return {
    success,
    info,
    warning,
    error,
  };
};
