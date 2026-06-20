import type PhotoSwipe from 'photoswipe';
import type { DataSource } from 'photoswipe';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

type OpenLightboxOptions = {
  slides: { src: string }[];
};

const getImageSize = (src: string) => {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = (error) => reject(error);
    img.src = src;
  });
};

const bindWheelZoom = (photoSwipe: PhotoSwipe) => {
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const currZoomLevel = photoSwipe.currSlide?.currZoomLevel ?? 1;
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoomLevel = currZoomLevel * delta;
    const min = photoSwipe.currSlide?.zoomLevels.initial ?? 1;
    const max = photoSwipe.currSlide?.zoomLevels.max ?? 4;
    const clamped = Math.min(Math.max(newZoomLevel, min), max);
    photoSwipe.currSlide?.zoomTo(clamped, { x: e.clientX, y: e.clientY }, 0);
  };
  photoSwipe.element?.addEventListener('wheel', handleWheel, { passive: false });
  return () => photoSwipe.element?.removeEventListener('wheel', handleWheel);
};

export const useLightbox = () => {
  let lightbox: PhotoSwipeLightbox | null = null;
  let cleanupWheel: (() => void) | null = null;

  const destroyLightbox = () => {
    cleanupWheel?.();
    cleanupWheel = null;
    lightbox?.destroy();
    lightbox = null;
  };

  const openLightbox = async ({ slides }: OpenLightboxOptions) => {
    if (import.meta.server || slides.length === 0) return;

    destroyLightbox();

    const dataSource: DataSource = await Promise.all(
      slides.map(async (slide) => {
        const { width, height } = await getImageSize(slide.src);
        return { src: slide.src, width, height };
      }),
    );

    lightbox = new PhotoSwipeLightbox({
      dataSource,
      secondaryZoomLevel: 2,
      pswpModule: () => import('photoswipe'),
      paddingFn: (viewportSize) => ({
        top: viewportSize.y * 0.1,
        bottom: viewportSize.y * 0.1,
        left: viewportSize.x * 0.1,
        right: viewportSize.x * 0.1,
      }),
    });

    lightbox.on('afterInit', () => {
      if (lightbox?.pswp) {
        cleanupWheel = bindWheelZoom(lightbox.pswp);
        document.body.style.pointerEvents = 'auto';
      }
    });

    lightbox.on('destroy', () => {
      cleanupWheel?.();
      cleanupWheel = null;
      document.body.style.pointerEvents = '';
    });

    lightbox.init();
    lightbox.loadAndOpen(0);
  };

  onUnmounted(() => destroyLightbox());

  return {
    openLightbox,
  };
};
