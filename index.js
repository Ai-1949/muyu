/**
 * FC 自定义运行时占位 handler（满足控制台/API 对 handler 字段的要求）。
 * HTTP 访问由 HTTP 触发器转发至 customRuntimeConfig.port（3000）上的 Next 进程。
 */
exports.handler = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: '请通过 HTTP 触发器访问 Next 服务' }),
});
