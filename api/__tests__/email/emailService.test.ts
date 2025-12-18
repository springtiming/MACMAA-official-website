import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Resend before importing email service
const mockSend = vi.fn();
vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      };
      constructor(_apiKey?: string) {
        // Constructor implementation
      }
    },
  };
});

describe("Email Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockSend.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("emailConfig", () => {
    it("should detect missing API key", async () => {
      delete process.env.RESEND_API_KEY;
      const { emailConfig } = await import("../../_emailService.js");
      expect(emailConfig.hasApiKey).toBe(false);
    });

    it("should detect present API key", async () => {
      process.env.RESEND_API_KEY = "test-key";
      const { emailConfig } = await import("../../_emailService.js");
      expect(emailConfig.hasApiKey).toBe(true);
    });

    it("should use default from email when not configured", async () => {
      delete process.env.RESEND_FROM_EMAIL;
      const { emailConfig } = await import("../../_emailService.js");
      expect(emailConfig.defaultFrom).toBe("VMCA <onboarding@resend.dev>");
    });

    it("should use configured from email", async () => {
      process.env.RESEND_FROM_EMAIL = "Test <test@example.com>";
      const { emailConfig } = await import("../../_emailService.js");
      expect(emailConfig.defaultFrom).toBe("Test <test@example.com>");
    });

    it("should read admin email from environment", async () => {
      process.env.ADMIN_NOTIFICATION_EMAIL = "admin@test.com";
      const { emailConfig } = await import("../../_emailService.js");
      expect(emailConfig.adminEmail).toBe("admin@test.com");
    });
  });

  describe("sendEmail", () => {
    it("should skip sending when API key is missing", async () => {
      delete process.env.RESEND_API_KEY;
      const { sendEmail } = await import("../../_emailService.js");
      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });
      expect(result.ok).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("missing-api-key");
    });

    it("should skip sending when no recipient", async () => {
      process.env.RESEND_API_KEY = "test-key";
      const { sendEmail } = await import("../../_emailService.js");
      const result = await sendEmail({
        to: "",
        subject: "Test",
        html: "<p>Test</p>",
      });
      expect(result.ok).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("no-recipient");
    });

    it("should normalize recipient array", async () => {
      process.env.RESEND_API_KEY = "test-key";
      mockSend.mockResolvedValue({
        data: { id: "test-id" },
        error: null,
      });

      const { sendEmail } = await import("../../_emailService.js");
      await sendEmail({
        to: ["test1@example.com", "test2@example.com"],
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["test1@example.com", "test2@example.com"],
        })
      );
    });
  });

  describe("sendMemberApplicationSubmitted", () => {
    it("should send email to user when email provided", async () => {
      process.env.RESEND_API_KEY = "test-key";
      mockSend.mockResolvedValue({
        data: { id: "test-id" },
        error: null,
      });

      const { sendMemberApplicationSubmitted } = await import("../../_emailService.js");
      const result = await sendMemberApplicationSubmitted({
        chineseName: "测试用户",
        englishName: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        applyDate: "2025-01-01",
      });

      expect(result.user?.ok).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["test@example.com"],
          subject: "MACMAA 会员申请已提交 / Membership Application Received",
        })
      );
    });

    it("should send email to admin when ADMIN_EMAIL configured", async () => {
      process.env.RESEND_API_KEY = "test-key";
      process.env.ADMIN_NOTIFICATION_EMAIL = "admin@test.com";
      mockSend.mockResolvedValue({
        data: { id: "test-id" },
        error: null,
      });

      const { sendMemberApplicationSubmitted } = await import("../../_emailService.js");
      await sendMemberApplicationSubmitted({
        chineseName: "测试用户",
        email: "test@example.com",
      });

      // 检查第二次调用（管理员邮件）
      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(mockSend).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          to: ["admin@test.com"],
          subject: "New member application received",
        })
      );
    });
  });

  describe("sendMemberApprovedEmail", () => {
    it("should skip when member has no email", async () => {
      const { sendMemberApprovedEmail } = await import("../../_emailService.js");
      const result = await sendMemberApprovedEmail({
        chinese_name: "测试用户",
        email: null,
      });
      expect(result.ok).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.reason).toBe("no-recipient");
    });

    it("should send approval email", async () => {
      process.env.RESEND_API_KEY = "test-key";
      mockSend.mockResolvedValue({
        data: { id: "test-id" },
        error: null,
      });

      const { sendMemberApprovedEmail } = await import("../../_emailService.js");
      const result = await sendMemberApprovedEmail({
        chinese_name: "测试用户",
        english_name: "Test User",
        email: "test@example.com",
      });

      expect(result.ok).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["test@example.com"],
          subject: "MACMAA 会员申请通过 / Membership Approved",
        })
      );
    });
  });

  describe("sendEventRegistrationEmails", () => {
    it("should send email to user when email provided", async () => {
      process.env.RESEND_API_KEY = "test-key";
      mockSend.mockResolvedValue({
        data: { id: "test-id" },
        error: null,
      });

      const { sendEventRegistrationEmails } = await import("../../_emailService.js");
      const result = await sendEventRegistrationEmails({
        eventTitleZh: "测试活动",
        eventTitleEn: "Test Event",
        name: "测试用户",
        email: "test@example.com",
        tickets: 2,
        paymentMethod: "card",
      });

      expect(result.user?.ok).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["test@example.com"],
          subject: "活动报名确认 / Event Registration Confirmed",
        })
      );
    });

    it("should send admin email when notes provided and option enabled", async () => {
      process.env.RESEND_API_KEY = "test-key";
      process.env.ADMIN_NOTIFICATION_EMAIL = "admin@test.com";
      mockSend.mockResolvedValue({
        data: { id: "test-id" },
        error: null,
      });

      const { sendEventRegistrationEmails } = await import("../../_emailService.js");
      await sendEventRegistrationEmails(
        {
          eventTitleZh: "测试活动",
          name: "测试用户",
          email: "test@example.com",
          notes: "测试备注",
        },
        { sendNotesToAdmin: true }
      );

      // 检查第二次调用（管理员邮件）
      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(mockSend).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          to: ["admin@test.com"],
          subject: "新活动报名含备注 / New Registration with Notes",
        })
      );
    });
  });
});




