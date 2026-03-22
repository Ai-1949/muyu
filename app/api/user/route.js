import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

/**
 * GET /api/user
 * 需登录 Cookie
 * 响应：{ user: { id, email, nickname } } 或 401
 */
export async function GET() {
  const uid = getSessionUserId();
  if (!uid) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // Prisma：读取用户资料（不含密码）
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, email: true, nickname: true },
  });
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 401 });
  }
  return NextResponse.json({ user });
}

/**
 * PATCH /api/user
 * 请求体 JSON：{ nickname: string }
 * 响应：{ user: { id, email, nickname } }
 */
export async function PATCH(request) {
  const uid = getSessionUserId();
  if (!uid) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }

  const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : '';
  if (!nickname || nickname.length > 20) {
    return NextResponse.json({ error: '昵称长度应为 1–20 字' }, { status: 400 });
  }

  // Prisma：更新昵称
  const user = await prisma.user.update({
    where: { id: uid },
    data: { nickname },
    select: { id: true, email: true, nickname: true },
  });

  return NextResponse.json({ user });
}
