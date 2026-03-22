import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind 类名（shadcn/ui 惯例）
 * @param {...any} inputs - 任意类名片段
 * @returns {string} 合并后的 className
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 将任意 Date 转为「上海时区」的日历日期字符串 YYYY-MM-DD（用于功德按日统计）
 * @param {Date} d
 * @returns {string}
 */
export function toShanghaiDateString(d) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * 获取上海时区「今天」的日期字符串
 * @returns {string}
 */
export function shanghaiTodayString() {
  return toShanghaiDateString(new Date());
}

/**
 * 计算连续有功德的天数：若今天未敲则为 0；否则从今天往前数连续有记录的天数
 * @param {Set<string>} uniqueYmd - 出现过功德的上海日历日集合
 * @param {string} todayYmd - 今天的上海日期
 * @returns {number}
 */
export function computeStreakFromDates(uniqueYmd, todayYmd) {
  if (!uniqueYmd.has(todayYmd)) return 0;
  let streak = 1;
  let cursor = todayYmd;
  while (true) {
    const prev = addDaysToYmd(cursor, -1);
    if (uniqueYmd.has(prev)) {
      streak += 1;
      cursor = prev;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * YYYY-MM-DD 加减天数（按日历推算，忽略夏令时）
 * @param {string} ymd
 * @param {number} deltaDays
 * @returns {string}
 */
export function addDaysToYmd(ymd, deltaDays) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * 生成最近 N 天的上海日期列表（含今天），从旧到新
 * @param {number} n
 * @returns {string[]}
 */
export function lastNDaysShanghai(n) {
  const today = shanghaiTodayString();
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(addDaysToYmd(today, -i));
  }
  return out;
}

/**
 * 将 MeritRecord.createdAt 列表转为按上海日历日的计数 Map
 * @param {Date[]} dates
 * @returns {Map<string, number>}
 */
export function countByShanghaiDay(dates) {
  const map = new Map();
  for (const dt of dates) {
    const key = toShanghaiDateString(dt);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}
