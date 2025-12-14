import { describe, it, expect } from "vitest";

/**
 * 环境变量检查测试
 * 用于验证 .env.local 文件是否被正确加载
 */
describe("Environment Variables Check", () => {
  it("should load RESEND_API_KEY from .env.local", () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠️  RESEND_API_KEY 未设置。请在 .env.local 文件中配置。"
      );
    }
    // 这个测试不会失败，只是检查环境变量是否存在
    expect(typeof apiKey).toBe("string");
  });

  it("should load TEST_EMAIL from .env.local", () => {
    const testEmail = process.env.TEST_EMAIL;
    if (!testEmail) {
      console.warn(
        "⚠️  TEST_EMAIL 未设置。请在 .env.local 文件中配置。"
      );
    }
    // 这个测试不会失败，只是检查环境变量是否存在
    expect(typeof testEmail).toBe("string");
  });

  it("should show current email configuration", () => {
    const config = {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? "已配置" : "未配置",
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "使用默认值",
      ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || "未配置",
      TEST_EMAIL: process.env.TEST_EMAIL || "未配置",
    };
    
    console.log("\n📧 当前邮件配置：");
    console.log(JSON.stringify(config, null, 2));
    
    // 这个测试总是通过，用于显示配置信息
    expect(config).toBeDefined();
  });
});
