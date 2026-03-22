import { redirect } from 'next/navigation';
import { HomeClient } from '@/components/HomeClient';
import { getSessionUserId } from '@/lib/session';

/**
 * 未登录首页：若已有会话则进入仪表盘
 */
export default function HomePage() {
  const uid = getSessionUserId();
  if (uid) {
    redirect('/dashboard');
  }
  return <HomeClient />;
}
