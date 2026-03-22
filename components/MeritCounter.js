'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 功德数字展示：数值变化时在 0.3s 内从旧值滚动过渡到新值
 * @param {{ value: number, label: string, className?: string }} props
 */
export function MeritCounter({ value, label, className = '' }) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  displayRef.current = display;

  useEffect(() => {
    const from = displayRef.current;
    if (from === value) return;

    let raf = 0;
    const start = performance.now();
    const duration = 300;

    /**
     * 每帧根据 easeOutCubic 插值刷新显示数字
     * @param {number} now - performance.now()
     */
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(from + (value - from) * eased);
      setDisplay(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 ${className}`}
      aria-live="polite"
    >
      <span className="text-xs tracking-widest text-zen-mist">{label}</span>
      <span className="font-serif text-3xl font-semibold text-zen-ink tabular-nums sm:text-4xl">
        {display}
      </span>
    </div>
  );
}
