const DESKTOP_HEADER_OFFSET = 76;
const MOBILE_HEADER_OFFSET = 66;
const MOBILE_BREAKPOINT = 640;

let activeFrame: number | null = null;

export const smoothScrollEasing = (progress: number) =>
  progress >= 1 ? 1 : 1 - Math.pow(2, -10 * progress);

export const headerOffsetForWidth = (width: number) =>
  width <= MOBILE_BREAKPOINT ? MOBILE_HEADER_OFFSET : DESKTOP_HEADER_OFFSET;

export const cancelSmoothScroll = () => {
  if (activeFrame !== null) {
    window.cancelAnimationFrame(activeFrame);
    activeFrame = null;
  }
};

export const scrollToHash = (
  hash: string,
  {
    motionEnabled = true,
    onComplete,
  }: { motionEnabled?: boolean; onComplete?: () => void } = {},
) => {
  if (!hash.startsWith("#") || hash.length < 2) return false;

  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return false;

  cancelSmoothScroll();
  const start = window.scrollY;
  const destination = Math.max(
    0,
    start +
      target.getBoundingClientRect().top -
      headerOffsetForWidth(window.innerWidth),
  );
  const distance = destination - start;
  const reduceMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  if (!motionEnabled || reduceMotion || Math.abs(distance) < 2) {
    window.scrollTo({ top: destination, left: 0 });
    onComplete?.();
    return true;
  }

  const duration = Math.min(900, Math.max(440, 380 + Math.abs(distance) * 0.12));
  const startedAt = performance.now();

  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    window.scrollTo({
      top: start + distance * smoothScrollEasing(progress),
      left: 0,
    });
    if (progress < 1) activeFrame = window.requestAnimationFrame(step);
    else {
      activeFrame = null;
      onComplete?.();
    }
  };

  activeFrame = window.requestAnimationFrame(step);
  return true;
};