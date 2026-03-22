/**
 * 简易内存滑动窗口限流：每个 key 在 windowMs 内最多 max 次请求
 * 适用于单机开发/演示；多实例部署需换共享存储方案
 */

const buckets = new Map();

/**
 * 判断是否允许本次请求
 * @param {string} key - 例如 userId 字符串
 * @param {{ max?: number, windowMs?: number }} [opts]
 * @param {number} [opts.max=3] - 窗口内最大次数
 * @param {number} [opts.windowMs=1000] - 窗口长度（毫秒）
 * @returns {boolean} true 表示允许，false 表示拒绝
 */
export function allowRate(key, opts = {}) {
  const max = opts.max ?? 3;
  const windowMs = opts.windowMs ?? 1000;
  const now = Date.now();
  let arr = buckets.get(key);
  if (!arr) {
    arr = [];
    buckets.set(key, arr);
  }
  const cutoff = now - windowMs;
  while (arr.length && arr[0] < cutoff) arr.shift();
  if (arr.length >= max) return false;
  arr.push(now);
  return true;
}
