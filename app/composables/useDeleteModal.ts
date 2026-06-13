import { DeleteModal } from '#components';

type Options = {
  itemTypeName?: string;
  itemTitle?: string;
  itemImage?: string;
};

export const useDeleteModal = () => {
  const overlay = useOverlay();

  return (options: Options): Promise<boolean> => {
    const modal = overlay.create(DeleteModal, {
      destroyOnClose: true, // 避免記憶體洩漏，因為每次呼叫都會 create 一個新的
      props: options,
    });

    return modal.open();
  };
};
