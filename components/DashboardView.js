'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { MeritChart } from '@/components/MeritChart';
import { MeritCounter } from '@/components/MeritCounter';
import { readZenPreferences, SettingsModal } from '@/components/SettingsModal';
import { WoodFishOrBell } from '@/components/WoodFishOrBell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * 已登录主页：顶部栏、木鱼/钟、统计卡片、柱状图
 * @param {{ initialUser: { id: number, email: string, nickname: string } }} props
 */
export function DashboardView({ initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tapMode, setTapMode] = useState('wood');
  const [soundMode, setSoundMode] = useState('wood');
  const [bgTheme, setBgTheme] = useState('white');
  const [merit, setMerit] = useState({
    today: 0,
    total: 0,
    streak: 0,
    weekly: [],
    weekLabels: [],
  });
  const [hint, setHint] = useState('');
  const [loadedPrefs, setLoadedPrefs] = useState(false);

  /** 拉取 /api/merit 填充统计与图表 */
  const refreshMerit = useCallback(async () => {
    try {
      const res = await fetch('/api/merit', { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setMerit({
        today: data.today ?? 0,
        total: data.total ?? 0,
        streak: data.streak ?? 0,
        weekly: Array.isArray(data.weekly) ? data.weekly : [],
        weekLabels: Array.isArray(data.weekLabels) ? data.weekLabels : [],
      });
    } catch {
      // 静默失败，保留旧数据
    }
  }, []);

  useEffect(() => {
    refreshMerit();
  }, [refreshMerit]);

  useEffect(() => {
    const p = readZenPreferences();
    setTapMode(p.tapMode);
    setSoundMode(p.soundMode);
    setBgTheme(p.bgTheme);
    setLoadedPrefs(true);
  }, []);

  const chartLabels = useMemo(
    () => merit.weekLabels.map((d) => (typeof d === 'string' ? d.slice(5).replace('-', '/') : '')),
    [merit.weekLabels],
  );

  const shellClass = cn(
    'min-h-screen w-full transition-colors duration-500',
    bgTheme === 'temple' &&
      'bg-gradient-to-b from-[#f8e8e8] via-[#efd4d4] to-[#e2bcbc] text-zen-ink',
    bgTheme === 'night' &&
      'bg-gradient-to-b from-zen-night via-[#222636] to-zen-nightMist text-zen-paper',
    bgTheme === 'white' && 'bg-gradient-to-b from-zen-paper via-[#f3efe8] to-[#e8e2da] text-zen-ink',
  );

  const onStats = useCallback((payload) => {
    setMerit({
      today: payload.today ?? 0,
      total: payload.total ?? 0,
      streak: payload.streak ?? 0,
      weekly: Array.isArray(payload.weekly) ? payload.weekly : [],
      weekLabels: Array.isArray(payload.weekLabels) ? payload.weekLabels : [],
    });
  }, []);

  const onRateLimited = useCallback(() => {
    setHint('节奏慢一点，每秒最多三下哦');
    window.setTimeout(() => setHint(''), 2200);
  }, []);

  return (
    <div className={shellClass}>
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex flex-col">
          <span className="text-xs tracking-[0.2em] text-current/60">禅修</span>
          <span className="font-serif text-lg font-semibold">{user.nickname}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 border-current/20 bg-white/10 backdrop-blur-sm"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
          设置
        </Button>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 pb-16 pt-4 sm:px-8">
        <section className="flex w-full flex-col items-center justify-center py-6">
          {loadedPrefs ? (
            <WoodFishOrBell
              mode={tapMode}
              soundMode={soundMode}
              onStats={onStats}
              onRateLimited={onRateLimited}
            />
          ) : (
            <div className="h-48 w-48 animate-pulse rounded-full bg-current/5" aria-hidden />
          )}
        </section>

        <section className="grid w-full grid-cols-3 gap-3 sm:gap-4">
          <Card
            className={cn(
              'border-current/10 shadow-zen backdrop-blur-md',
              bgTheme === 'night' ? 'bg-white/10' : 'bg-white/55',
            )}
          >
            <CardContent className="pt-6">
              <MeritCounter value={merit.today} label="今日功德" />
            </CardContent>
          </Card>
          <Card
            className={cn(
              'border-current/10 shadow-zen backdrop-blur-md',
              bgTheme === 'night' ? 'bg-white/10' : 'bg-white/55',
            )}
          >
            <CardContent className="pt-6">
              <MeritCounter value={merit.total} label="总功德" />
            </CardContent>
          </Card>
          <Card
            className={cn(
              'border-current/10 shadow-zen backdrop-blur-md',
              bgTheme === 'night' ? 'bg-white/10' : 'bg-white/55',
            )}
          >
            <CardContent className="pt-6">
              <MeritCounter value={merit.streak} label="连续天数" />
            </CardContent>
          </Card>
        </section>

        <Card
          className={cn(
            'w-full border-current/10 shadow-zen backdrop-blur-md',
            bgTheme === 'night' ? 'bg-white/10' : 'bg-white/60',
          )}
        >
          <CardHeader>
            <CardTitle className="font-serif text-base">近七日功德</CardTitle>
          </CardHeader>
          <CardContent>
            {merit.weekLabels.length > 0 ? (
              <MeritChart labels={chartLabels} data={merit.weekly} />
            ) : (
              <div className="flex h-56 items-center justify-center rounded-lg bg-current/5 text-sm text-current/50">
                正在加载图表…
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {hint ? (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-zen-gold/30 bg-zen-ink/85 px-4 py-2 text-sm text-zen-paper shadow-zen transition-opacity duration-300">
          {hint}
        </div>
      ) : null}

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
        onUserUpdated={(u) => setUser((prev) => ({ ...prev, nickname: u.nickname }))}
        tapMode={tapMode}
        onTapModeChange={setTapMode}
        soundMode={soundMode}
        onSoundModeChange={setSoundMode}
        bgTheme={bgTheme}
        onBgThemeChange={setBgTheme}
        onLogout={() => {
          setSettingsOpen(false);
          router.push('/');
          router.refresh();
        }}
      />
    </div>
  );
}
