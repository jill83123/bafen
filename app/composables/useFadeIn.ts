import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type FadeDirection = 'up' | 'down' | 'left' | 'right';
type TriggerTarget = 'self' | 'parent' | string | HTMLElement;
type TriggerEdgePosition = 'top' | 'center' | 'bottom';
type ViewportPosition = number;

type FadeInOptions = {
  direction?: FadeDirection;
  offset?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  trigger?: TriggerTarget;
  triggerEdge?: TriggerEdgePosition;
  viewportPosition?: ViewportPosition;
  immediate?: boolean;
  replay?: boolean;
};

type ResolvedFadeInOptions = Required<FadeInOptions>;

type FadeInTarget =
  string | HTMLElement | HTMLElement[] | Ref<HTMLElement | null> | Ref<HTMLElement[] | null>;

const DEFAULT_OPTIONS: ResolvedFadeInOptions = {
  direction: 'up',
  offset: 120,
  duration: 1,
  ease: 'power2.out',
  stagger: 0.15,
  trigger: 'self',
  triggerEdge: 'top',
  viewportPosition: 80,
  immediate: false,
  replay: true,
};

const getOffsetVars = (direction: FadeDirection, offset: number): { x: number; y: number } => {
  switch (direction) {
    case 'left':
      return { x: offset, y: 0 };
    case 'right':
      return { x: -offset, y: 0 };
    case 'up':
      return { x: 0, y: offset };
    case 'down':
      return { x: 0, y: -offset };
    default:
      return { x: 0, y: 0 };
  }
};

const resolveTriggerElement = (trigger: TriggerTarget, el: HTMLElement): HTMLElement => {
  if (trigger === 'self') return el;
  if (trigger === 'parent') return el.parentElement ?? el;
  if (typeof trigger === 'string') return document.querySelector<HTMLElement>(trigger) ?? el;
  return trigger;
};

const normalizeToArray = (value: HTMLElement | HTMLElement[] | null): HTMLElement[] => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

const resolveElements = (target: FadeInTarget): HTMLElement[] => {
  if (typeof target === 'string') return Array.from(document.querySelectorAll(target));
  if (isRef(target)) return normalizeToArray(target.value);
  return normalizeToArray(target);
};

let registered = false;
let globalRefreshTimer: ReturnType<typeof setTimeout> | null = null;

const scheduleGlobalRefresh = () => {
  if (globalRefreshTimer) clearTimeout(globalRefreshTimer);
  globalRefreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100);
};

export const useFadeIn = () => {
  if (import.meta.client && !registered) {
    gsap.registerPlugin(ScrollTrigger);

    const bodyObserver = new ResizeObserver(() => scheduleGlobalRefresh());
    bodyObserver.observe(document.body);

    registered = true;
  }

  const fadeIn = (
    target: FadeInTarget,
    options: FadeInOptions | FadeInOptions[] = {},
  ): {
    replay: () => void;
  } => {
    const tweens: gsap.core.Tween[] = [];

    const dispose = () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
      tweens.length = 0;
    };

    const build = (resolved: HTMLElement[]) => {
      dispose(); // 清掉舊動畫，避免重複綁定

      resolved.forEach((el, i) => {
        const opts: ResolvedFadeInOptions = {
          ...DEFAULT_OPTIONS,
          ...(Array.isArray(options) ? (options[i] ?? {}) : options),
        };

        const fromVars = {
          opacity: 0,
          ...getOffsetVars(opts.direction, opts.offset),
        };

        const triggerEl = resolveTriggerElement(opts.trigger, el);
        const isSelfTrigger = triggerEl === el;

        const tween = gsap.fromTo(el, fromVars, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: opts.duration,
          ease: opts.ease,
          delay: i * opts.stagger,
          ...(opts.immediate
            ? {}
            : {
                scrollTrigger: {
                  trigger: triggerEl,
                  start: `${opts.triggerEdge} ${opts.viewportPosition}%`,
                  toggleActions: opts.replay ? 'restart none none reverse' : 'play none none none',

                  ...(isSelfTrigger
                    ? {
                        invalidateOnRefresh: true, // 每次 refresh() 時，重新計算元素狀態
                        onRefreshInit: (self: ScrollTrigger) => {
                          if (self.trigger) gsap.set(self.trigger, { clearProps: 'transform' });
                        },
                      }
                    : {}),
                  // markers: true,
                },
              }),
        });
        tweens.push(tween);
      });
    };

    // 建立動畫
    if (!isRef(target)) {
      // HTMLElement：DOM 在 onNuxtReady 時已存在，可直接建立
      onNuxtReady(async () => {
        await nextTick();
        const resolved = resolveElements(target);
        if (resolved.length > 0) build(resolved);
      });
    } else {
      // Ref：可能是之後才被賦值（例如：v-for 動態收集的 template refs）
      watch(
        () => normalizeToArray(target.value),
        (resolved, prev) => {
          if (resolved.length > 0 && resolved.length !== prev?.length) build(resolved);
        },
        { flush: 'post' }, // 確保 DOM 已更新完成
      );
    }

    onUnmounted(dispose);

    const replay = () => tweens.forEach((tween) => tween.restart(true));

    return {
      replay,
    };
  };

  return {
    fadeIn,
  };
};
