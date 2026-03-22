import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'zen_session';

/**
 * 读取会话密钥：优先环境变量，开发环境提供默认值（请勿用于公网生产）
 * @returns {string}
 */
function getSecret() {
  return process.env.SESSION_SECRET || 'zen-merit-dev-secret-change-me';
}

/**
 * 创建已签名的会话令牌（HMAC-SHA256）
 * @param {number} userId - 用户主键
 * @param {number} [maxAgeMs=604800000] - 有效期，默认 7 天
 * @returns {string} 可写入 Cookie 的字符串
 */
export function createSessionToken(userId, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + maxAgeMs }),
    'utf8',
  ).toString('base64url');
  const sig = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/**
 * 校验会话令牌并返回用户 id；失败返回 null
 * @param {string} token
 * @returns {number | null}
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  try {
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof json.uid !== 'number' || typeof json.exp !== 'number') return null;
    if (Date.now() > json.exp) return null;
    return json.uid;
  } catch {
    return null;
  }
}

/**
 * 从当前请求 Cookie 解析登录用户 id（用于 Server Component / Route Handler）
 * @returns {number | null}
 */
export function getSessionUserId() {
  const store = cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifySessionToken(raw);
}

/**
 * 会话 Cookie 名称（供 API 设置/清除时复用）
 * @returns {string}
 */
export function sessionCookieName() {
  return COOKIE_NAME;
}
