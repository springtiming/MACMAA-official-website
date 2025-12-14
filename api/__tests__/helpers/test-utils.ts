/**
 * 测试工具函数
 * 提供测试中常用的辅助函数
 */

/**
 * 创建模拟的环境变量对象
 */
export function createMockEnv(overrides: Record<string, string> = {}) {
  return {
    RESEND_API_KEY: "test-api-key",
    RESEND_FROM_EMAIL: "Test <test@example.com>",
    ADMIN_NOTIFICATION_EMAIL: "admin@test.com",
    TEST_EMAIL: "test@example.com",
    ...overrides,
  };
}

/**
 * 等待指定时间（用于测试异步操作）
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
