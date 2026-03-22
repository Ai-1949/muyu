'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 未登录首页：邮箱注册 / 登录表单
 */
export function HomeClient() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 提交登录或注册
   * @param {React.FormEvent} e
   */
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || '请求失败');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('网络异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zen-paper via-[#f3efe8] to-[#e8e2da] px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-zen-ink sm:text-4xl">禅意积功德</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zen-mist">
          电子木鱼与钟，轻触即得一份安定。记录今日善念，随岁月慢慢累积。
        </p>
      </div>

      <Card className="w-full max-w-md border-zen-wood/12 shadow-zen">
        <CardHeader>
          <CardTitle className="font-serif">{mode === 'login' ? '登录' : '注册'}</CardTitle>
          <CardDescription>使用邮箱与密码，无需验证码。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="至少 6 位"
              />
            </div>
            {error ? <p className="text-sm text-zen-temple">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '提交中…' : mode === 'login' ? '登录' : '注册并进入'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-zen-mist">
            <button
              type="button"
              className="underline decoration-zen-gold/50 underline-offset-4 transition hover:text-zen-ink"
              onClick={() => {
                setMode((m) => (m === 'login' ? 'register' : 'login'));
                setError('');
              }}
            >
              {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
