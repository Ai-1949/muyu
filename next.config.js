/** @type {import('next').NextConfig} */
// Next.js 应用配置：纯 JavaScript 项目，关闭严格模式以外的实验项
const nextConfig = {
  reactStrictMode: true,
  // FC 自定义运行时通过 node .next/standalone/server.js 启动，需开启 standalone 输出
  output: 'standalone',
};

module.exports = nextConfig;
