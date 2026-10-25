import { useEffect, useRef, useState } from "react";

/** Tracks an element's content width so SVG charts can draw at true pixel size. */
export const useElementWidth = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Eases a number from its previous value to `target`. */
export const useCountUp = (target: number, duration = 700) => {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const from = fromRef.current;
    if (reduced || from === target) {
      fromRef.current = target;
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  return reduced ? target : value;
};

/** Rounds a maximum up to a tidy axis ceiling (1, 2, 5 × 10ⁿ). */
export const niceCeil = (max: number) => {
  if (max <= 4) return 4;
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const step = [1, 2, 5, 10].find((s) => s * exp >= max) ?? 10;
  return step * exp;
};

export const formatDay = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString([], opts);
