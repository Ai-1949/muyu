import { redirect } from 'next/navigation';
import { DashboardView } from '@/components/DashboardView';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

/**
 * 已登录首页：校验会话并从数据库读取用户展示名
 */
export default async function DashboardPage() {
  const uid = getSessionUserId();
  if (!uid) {
    redirect('/');
  }

  // Prisma：按 id 获取用户基础信息（不含密码）
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, email: true, nickname: true },
  });

  if (!user) {
    redirect('/');
  }

  return <DashboardView initialUser={user} />;
}
