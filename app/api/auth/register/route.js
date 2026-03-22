import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken, sessionCookieName } from '@/lib/session';

/**
 * POST /api/auth/register
 * 请求体 JSON：{ email: string, password: string }
 * 成功：201 + Set-Cookie 会话 + { ok: true, user: { id, email, nickname } }
 * 失败：400 参数错误 / 409 邮箱已存在
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
  }

  // Prisma：检查邮箱唯一性
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  // Prisma：创建用户
  const user = await prisma.user.create({
    data: { email, password: hashed },
    select: { id: true, email: true, nickname: true },
  });

  const token = createSessionToken(user.id);
  const res = NextResponse.json({ ok: true, user }, { status: 201 });
  res.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
