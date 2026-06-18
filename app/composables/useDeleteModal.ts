import { DeleteModal } from '#components';

type Options = {
  itemTypeName?: string;
  itemTitle?: string;
  itemImage?: string;
  onConfirm: () => Promise<void> | void;
};

export const useDeleteModal = () => {
  const overlay = useOverlay();

  return async (options: Options) => {
    const { onConfirm, ...modalProps } = options;

    const modal = overlay.create(DeleteModal, {
      destroyOnClose: true, // 避免記憶體洩漏，因為每次呼叫都會 create 一個新的
      props: modalProps,
    });

    const confirmed = await modal.open();
    if (confirmed) await onConfirm();
  };
};
