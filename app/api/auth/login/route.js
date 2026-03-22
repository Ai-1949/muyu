import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken, sessionCookieName } from '@/lib/session';

/**
 * POST /api/auth/login
 * 请求体 JSON：{ email: string, password: string }
 * 成功：200 + Set-Cookie + { ok: true, user: { id, email, nickname } }
 * 失败：400 / 401
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须为 JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: '请填写邮箱与密码' }, { status: 400 });
  }

  // Prisma：按邮箱查找用户（含密码哈希）
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
  }

  const token = createSessionToken(user.id);
  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, nickname: user.nickname },
  });
  res.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
