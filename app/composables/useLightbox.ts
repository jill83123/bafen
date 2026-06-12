import type { CarouselSlide, FancyboxOptions } from '@fancyapps/ui';
import { Fancybox } from '@fancyapps/ui';

type OpenLightboxOptions = {
  slides: Partial<CarouselSlide>[];
};

export const useLightbox = () => {
  const openLightbox = async ({ slides }: OpenLightboxOptions) => {
    if (import.meta.server || slides.length === 0) return;

    const options: Partial<FancyboxOptions> = {
      Carousel: {
        Toolbar: {
          display: {
            left: ['counter'],
            middle: ['zoomIn', 'zoomOut', 'reset'],
            right: ['close'],
          },
        },
      },
    };

    Fancybox.show(slides, { ...options });
    document.body.style.pointerEvents = 'auto'; // 確保滑鼠能夠放大與拖曳 slide 等操作
  };

  return { openLightbox };
};
