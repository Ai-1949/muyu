'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const TAP_HISTORY_KEY = 'zen_tap_history';

/**
 * 将本次点击类型写入 localStorage（可选功能：本地记录木鱼/钟）
 * @param {'wood'|'bell'} tapType
 */
function appendLocalTapLog(tapType) {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(TAP_HISTORY_KEY) : null;
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ t: Date.now(), type: tapType });
    window.localStorage.setItem(TAP_HISTORY_KEY, JSON.stringify(arr.slice(-500)));
  } catch {
    // 存储失败时静默忽略，不影响主流程
  }
}

/**
 * 客户端滑动窗口限流：1 秒内最多 3 次点击（与后端一致）
 * @param {React.MutableRefObject<number[]>} timesRef
 * @returns {boolean}
 */
function clientAllowTap(timesRef) {
  const now = Date.now();
  const windowMs = 1000;
  const arr = timesRef.current.filter((t) => now - t < windowMs);
  if (arr.length >= 3) return false;
  arr.push(now);
  timesRef.current = arr;
  return true;
}

/**
 * Web Audio：木鱼声 — 短促下调的正弦包络，模拟木质闷响
 * @param {AudioContext} ctx
 */
function playWoodSound(ctx) {
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, t0);
  osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.07);
  gain.gain.setValueAtTime(0.45, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.18);
}

/**
 * Web Audio：钟声 — 多个谐波衰减更慢，偏金属余韵
 * @param {AudioContext} ctx
 */
function playBellSound(ctx) {
  const t0 = ctx.currentTime;
  const freqs = [523.25, 784.88, 1046.5];
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    const peak = 0.18 / (i + 1);
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.2 + i * 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 1.4);
  });
}

/**
 * 核心交互：木鱼或铜钟，点击触发动画、震动、音效、粒子与后端 +1
 * @param {object} props
 * @param {'wood'|'bell'} props.mode - 当前敲击模式
 * @param {'wood'|'bell'|'mute'} props.soundMode - 音效偏好
 * @param {(payload: object) => void} props.onStats - 成功后回调最新统计
 * @param {() => void} [props.onRateLimited] - 被限流时的提示钩子
 */
export function WoodFishOrBell({ mode, soundMode, onStats, onRateLimited }) {
  const [scaling, setScaling] = useState(false);
  const [particles, setParticles] = useState([]);
  const audioCtxRef = useRef(null);
  const tapTimesRef = useRef([]);
  const pidRef = useRef(0);

  /**
   * 按用户选择的音效模式播放（与当前显示木鱼/钟可独立）
   */
  const triggerSound = useCallback(() => {
    if (soundMode === 'mute') return;
    const Ctx = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;
    if (!Ctx) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (soundMode === 'bell') playBellSound(ctx);
    else playWoodSound(ctx);
  }, [soundMode]);

  const handleTap = useCallback(async () => {
    if (!clientAllowTap(tapTimesRef)) {
      onRateLimited?.();
      return;
    }

    // 移动端震动 100ms（不支持时静默失败）
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }

    // 缩放动画：瞬间放大到 1.2，再在 0.2s 内回到 1.0
    setScaling(true);
    window.setTimeout(() => setScaling(false), 200);

    triggerSound();

    // 3–5 个粒子：金色光点 + 浅棕木屑色，向上飘散 1s
    const count = 3 + Math.floor(Math.random() * 3);
    const batchId = ++pidRef.current;
    const next = [];
    for (let i = 0; i < count; i += 1) {
      const isGold = Math.random() > 0.45;
      next.push({
        id: `${batchId}-${i}`,
        left: 42 + Math.random() * 16,
        delay: Math.random() * 0.08,
        hue: isGold ? 'gold' : 'chip',
      });
    }
    setParticles((prev) => [...prev, ...next]);
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !next.find((x) => x.id === p.id)));
    }, 1100);

    appendLocalTapLog(mode);

    try {
      const res = await fetch('/api/merit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tapType: mode }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        onRateLimited?.();
        return;
      }
      onStats(json);
    } catch {
      onRateLimited?.();
    }
  }, [mode, onRateLimited, onStats, triggerSound]);

  const isBell = mode === 'bell';

  return (
    <div className="relative flex w-[60vw] max-w-[min(60vw,420px)] flex-col items-center justify-center sm:w-[40vw] sm:max-w-md">
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        {particles.map((p) => (
          <span
            key={p.id}
            className={cn(
              'pointer-events-none absolute bottom-1/2 h-2 w-2 rounded-full motion-safe:animate-float-up',
              p.hue === 'gold'
                ? 'bg-gradient-to-br from-zen-goldSoft to-zen-gold shadow-[0_0_12px_rgba(201,162,39,0.7)]'
                : 'bg-gradient-to-br from-amber-200/90 to-zen-woodLight/90',
            )}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleTap}
        className={cn(
          'relative flex aspect-square w-full select-none items-center justify-center rounded-full border border-zen-wood/20 shadow-zen transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-gold/45 active:scale-[0.98]',
          scaling ? 'scale-[1.2]' : 'scale-100',
          isBell
            ? 'bg-gradient-to-br from-amber-100 via-zen-goldSoft/40 to-zen-gold/35'
            : 'bg-gradient-to-br from-zen-woodLight/50 via-amber-100/80 to-zen-wood/35',
        )}
        aria-label={isBell ? '敲击铜钟' : '敲击木鱼'}
      >
        {isBell ? (
          <span className="font-serif text-4xl text-zen-templeDeep drop-shadow-sm sm:text-5xl">钟</span>
        ) : (
          <span className="font-serif text-4xl text-zen-wood drop-shadow-sm sm:text-5xl">魚</span>
        )}
        <span
          className={cn(
            'pointer-events-none absolute inset-2 rounded-full opacity-40',
            isBell
              ? 'bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.65),transparent_55%)]'
              : 'bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.5),transparent_50%)]',
          )}
        />
      </button>
      <p className="mt-4 text-center text-sm text-zen-mist">
        {isBell ? '轻触钟面，一声清音' : '轻触木鱼，一声安定'}
      </p>
    </div>
  );
}
