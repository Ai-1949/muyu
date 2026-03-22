import { NextResponse } from 'next/server';
import { sessionCookieName } from '@/lib/session';

/**
 * POST /api/auth/logout
 * 清除会话 Cookie，返回 { ok: true }
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
