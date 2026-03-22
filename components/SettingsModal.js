'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LS_MODE = 'zen_tap_mode';
const LS_SOUND = 'zen_sound_mode';
const LS_BG = 'zen_bg_theme';

/**
 * 设置弹窗：修改昵称、敲击模式、音效、背景、退出登录
 * @param {object} props
 * @param {boolean} props.open - 是否打开
 * @param {(v: boolean) => void} props.onOpenChange
 * @param {{ nickname: string, email: string }} props.user
 * @param {(u: { nickname: string }) => void} props.onUserUpdated - 昵称保存成功后回调
 * @param {'wood'|'bell'} props.tapMode
 * @param {(m: 'wood'|'bell') => void} props.onTapModeChange
 * @param {'wood'|'bell'|'mute'} props.soundMode
 * @param {(s: 'wood'|'bell'|'mute') => void} props.onSoundModeChange
 * @param {'white'|'temple'|'night'} props.bgTheme
 * @param {(b: 'white'|'temple'|'night') => void} props.onBgThemeChange
 * @param {() => void} props.onLogout - 退出后由父级处理路由跳转
 */
export function SettingsModal({
  open,
  onOpenChange,
  user,
  onUserUpdated,
  tapMode,
  onTapModeChange,
  soundMode,
  onSoundModeChange,
  bgTheme,
  onBgThemeChange,
  onLogout,
}) {
  const [nickname, setNickname] = useState(user.nickname);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNickname(user.nickname);
      setError('');
    }
  }, [open, user.nickname]);

  /**
   * 将当前偏好写入 localStorage（模式 / 音效 / 背景）
   */
  const persistPrefs = (nextTap, nextSound, nextBg) => {
    try {
      window.localStorage.setItem(LS_MODE, nextTap);
      window.localStorage.setItem(LS_SOUND, nextSound);
      window.localStorage.setItem(LS_BG, nextBg);
    } catch {
      // 忽略存储异常
    }
  };

  /**
   * 保存昵称到后端 PATCH /api/user
   */
  async function handleSaveNickname() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || '保存失败');
        return;
      }
      onUserUpdated({ nickname: data.user.nickname });
      onOpenChange(false);
    } catch {
      setError('网络异常');
    } finally {
      setSaving(false);
    }
  }

  /**
   * 退出登录：POST /api/auth/logout
   */
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // 仍执行前端退出流程
    }
    onLogout();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>调整昵称、敲击方式、音效与背景。修改即时生效。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label htmlFor="nickname">昵称</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="禅修者"
            />
            <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={handleSaveNickname} disabled={saving}>
              {saving ? '保存中…' : '保存昵称'}
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>敲击模式</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={tapMode === 'wood' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onTapModeChange('wood');
                  persistPrefs('wood', soundMode, bgTheme);
                }}
              >
                木鱼
              </Button>
              <Button
                type="button"
                variant={tapMode === 'bell' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onTapModeChange('bell');
                  persistPrefs('bell', soundMode, bgTheme);
                }}
              >
                铜钟
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>音效</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'wood', label: '木鱼声' },
                { key: 'bell', label: '钟声' },
                { key: 'mute', label: '静音' },
              ].map((x) => (
                <Button
                  key={x.key}
                  type="button"
                  variant={soundMode === x.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onSoundModeChange(x.key);
                    persistPrefs(tapMode, x.key, bgTheme);
                  }}
                >
                  {x.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>背景</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'white', label: '禅意白' },
                { key: 'temple', label: '寺庙红' },
                { key: 'night', label: '星空黑' },
              ].map((x) => (
                <Button
                  key={x.key}
                  type="button"
                  variant={bgTheme === x.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    onBgThemeChange(x.key);
                    persistPrefs(tapMode, soundMode, x.key);
                  }}
                >
                  {x.label}
                </Button>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-zen-temple">{error}</p> : null}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button type="button" variant="destructive" className="w-full" onClick={handleLogout}>
            退出登录
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 从 localStorage 读取用户偏好（首次渲染在客户端执行）
 * @returns {{ tapMode: 'wood'|'bell', soundMode: 'wood'|'bell'|'mute', bgTheme: 'white'|'temple'|'night' }}
 */
export function readZenPreferences() {
  if (typeof window === 'undefined') {
    return { tapMode: 'wood', soundMode: 'wood', bgTheme: 'white' };
  }
  try {
    const m = window.localStorage.getItem(LS_MODE);
    const s = window.localStorage.getItem(LS_SOUND);
    const b = window.localStorage.getItem(LS_BG);
    return {
      tapMode: m === 'bell' ? 'bell' : 'wood',
      soundMode: s === 'bell' || s === 'mute' ? s : 'wood',
      bgTheme: b === 'temple' || b === 'night' ? b : 'white',
    };
  } catch {
    return { tapMode: 'wood', soundMode: 'wood', bgTheme: 'white' };
  }
}
