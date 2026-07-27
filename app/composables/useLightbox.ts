import type PhotoSwipe from 'photoswipe';
import type { DataSource } from 'photoswipe';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

type SlideItem = {
  src: string;
  width?: number;
  height?: number;
};

type OpenLightboxOptions = {
  slides: SlideItem[];
  index?: number;
};

// 在瀏覽器閒置時預先載入 PhotoSwipe 的 CSS
let isStyleLoaded = false;

// Safari 不支援 requestIdleCallback，退回用 setTimeout 代替
const idleCallback =
  (typeof window !== 'undefined' && window.requestIdleCallback) ||
  ((callback) => setTimeout(callback, 1));

const prefetchLightboxStyle = () => {
  if (import.meta.server) return;
  idleCallback(() => {
    if (!isStyleLoaded) {
      import('photoswipe/style.css').then(() => (isStyleLoaded = true));
    }
  });
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

  const openLightbox = async ({ slides, index = 0 }: OpenLightboxOptions) => {
    if (import.meta.server || slides.length === 0) return;

    destroyLightbox();

    const dataSource = (await Promise.all(
      slides.map(async (slide) => {
        if (slide.width && slide.height) return slide;

        const { width, height } = await getImageSize(slide.src);
        return { src: slide.src, width, height };
      }),
    )) as DataSource;

    lightbox = new PhotoSwipeLightbox({
      dataSource,
      secondaryZoomLevel: 2,
      loop: false,
      pswpModule: () => import('photoswipe'),
      paddingFn: (viewportSize) => ({
        top: viewportSize.y * 0.05,
        bottom: viewportSize.y * 0.05,
        left: viewportSize.x * 0.05,
        right: viewportSize.x * 0.05,
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
    lightbox.loadAndOpen(index);
  };

  onMounted(() => {
    prefetchLightboxStyle();
  });

  onUnmounted(() => destroyLightbox());

  return {
    openLightbox,
  };
};
