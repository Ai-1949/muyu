import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allowRate } from '@/lib/rateLimit';
import { getSessionUserId } from '@/lib/session';
import {
  computeStreakFromDates,
  countByShanghaiDay,
  lastNDaysShanghai,
  shanghaiTodayString,
  toShanghaiDateString,
} from '@/lib/utils';

/**
 * 根据用户 id 聚合功德统计（今日、总计、连续天、近 7 日柱状）
 * @param {number} userId
 * @returns {Promise<{ today: number, total: number, streak: number, weekly: number[], weekLabels: string[] }>}
 */
async function buildMeritPayload(userId) {
  // Prisma：拉取该用户所有功德记录的创建时间（用于按日聚合）
  const records = await prisma.meritRecord.findMany({
    where: { userId },
    select: { createdAt: true },
  });

  const todayYmd = shanghaiTodayString();
  const dayKeys = records.map((r) => toShanghaiDateString(r.createdAt));
  const uniqueDays = new Set(dayKeys);
  const today = dayKeys.filter((d) => d === todayYmd).length;
  const total = records.length;
  const streak = computeStreakFromDates(uniqueDays, todayYmd);

  const weekLabels = lastNDaysShanghai(7);
  const countMap = countByShanghaiDay(records.map((r) => r.createdAt));
  const weekly = weekLabels.map((d) => countMap.get(d) ?? 0);

  return { today, total, streak, weekly, weekLabels };
}

/**
 * GET /api/merit
 * 需登录。响应：{ today, total, streak, weekly, weekLabels }
 */
export async function GET() {
  const uid = getSessionUserId();
  if (!uid) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const payload = await buildMeritPayload(uid);
  return NextResponse.json(payload);
}

/**
 * POST /api/merit
 * 增加 1 次功德；服务端限流：同一用户每秒最多 3 次
 * 可选请求体：{ tapType?: 'wood' | 'bell' }（当前 schema 不存库，仅预留兼容前端）
 * 响应：与 GET 相同结构的最新统计
 */
export async function POST(request) {
  const uid = getSessionUserId();
  if (!uid) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const key = `merit:${uid}`;
  if (!allowRate(key, { max: 3, windowMs: 1000 })) {
    return NextResponse.json({ error: '点击过快，请稍后再试' }, { status: 429 });
  }

  try {
    await request.json();
  } catch {
    // 无 JSON 体也允许，仅记录一次点击
  }

  // Prisma：写入一条功德记录
  await prisma.meritRecord.create({
    data: { userId: uid },
  });

  const payload = await buildMeritPayload(uid);
  return NextResponse.json(payload);
}
