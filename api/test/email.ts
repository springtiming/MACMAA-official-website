import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  sendEmail,
  sendMemberApplicationSubmitted,
  sendMemberApprovedEmail,
  sendEventRegistrationEmails,
  emailConfig,
} from "../_emailService.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET") {
    return res.status(200).json({
      config: {
        hasApiKey: emailConfig.hasApiKey,
        defaultFrom: emailConfig.defaultFrom,
        adminEmail: emailConfig.adminEmail,
      },
      testEmail: process.env.TEST_EMAIL || "未配置",
      usage: {
        method: "POST",
        endpoint: "/api/test/email",
        body: {
          type: "simple | member-application | member-approved | event-registration",
          to: "your-test-email@example.com",
          ...{
            simple: {
              subject: "测试邮件",
              html: "<p>这是一封测试邮件</p>",
            },
            "member-application": {
              chineseName: "测试用户",
              englishName: "Test User",
              email: "test@example.com",
              phone: "1234567890",
            },
            "member-approved": {
              chinese_name: "测试用户",
              english_name: "Test User",
              email: "test@example.com",
            },
            "event-registration": {
              eventTitleZh: "测试活动",
              eventTitleEn: "Test Event",
              name: "测试用户",
              email: "test@example.com",
              tickets: 1,
            },
          },
        },
      },
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body ?? {};
  const { type, to, ...payload } = body;

  if (!type) {
    return res.status(400).json({
      error: "Missing 'type' field",
      validTypes: [
        "simple",
        "member-application",
        "member-approved",
        "event-registration",
      ],
    });
  }

  const testEmail = to || process.env.TEST_EMAIL;
  if (!testEmail) {
    return res.status(400).json({
      error:
        "Missing 'to' field and TEST_EMAIL environment variable not set",
      hint: "请在请求中提供 'to' 字段，或在环境变量中设置 TEST_EMAIL",
    });
  }

  try {
    let result;

    switch (type) {
      case "simple": {
        result = await sendEmail({
          to: testEmail,
          subject: payload.subject || "测试邮件 / Test Email",
          html: payload.html || "<p>这是一封测试邮件 / This is a test email</p>",
        });
        break;
      }

      case "member-application": {
        result = await sendMemberApplicationSubmitted({
          chineseName: payload.chineseName || "测试用户",
          englishName: payload.englishName || "Test User",
          email: testEmail,
          phone: payload.phone || "1234567890",
          applyDate: payload.applyDate || new Date().toISOString(),
        });
        break;
      }

      case "member-approved": {
        result = await sendMemberApprovedEmail({
          chinese_name: payload.chinese_name || "测试用户",
          english_name: payload.english_name || "Test User",
          email: testEmail,
        });
        break;
      }

      case "event-registration": {
        result = await sendEventRegistrationEmails(
          {
            eventTitleZh: payload.eventTitleZh || "测试活动",
            eventTitleEn: payload.eventTitleEn || "Test Event",
            name: payload.name || "测试用户",
            email: testEmail,
            tickets: payload.tickets || 1,
            paymentMethod: payload.paymentMethod || "card",
            notes: payload.notes || null,
          },
          { sendNotesToAdmin: Boolean(payload.sendNotesToAdmin) }
        );
        break;
      }

      default:
        return res.status(400).json({
          error: `Invalid type: ${type}`,
          validTypes: [
            "simple",
            "member-application",
            "member-approved",
            "event-registration",
            ],
        });
    }

    // 检查结果并返回详细信息
    const response: any = {
      ok: true,
      type,
      to: testEmail,
      result,
      config: {
        hasApiKey: emailConfig.hasApiKey,
        defaultFrom: emailConfig.defaultFrom,
        adminEmail: emailConfig.adminEmail,
      },
    };

    // 如果发送失败，添加诊断信息
    if (typeof result === "object" && result !== null) {
      if ("ok" in result && !result.ok) {
        response.diagnosis = {
          issue: result.skipped
            ? `邮件发送被跳过: ${result.reason}`
            : `邮件发送失败: ${result.error || "未知错误"}`,
          suggestions: result.reason === "missing-api-key"
            ? [
                "1. 检查 .env.local 文件中是否配置了 RESEND_API_KEY",
                "2. 确保使用 'npm run dev:api' 启动服务器",
                "3. 重启 vercel dev 服务器",
              ]
            : result.reason === "no-recipient"
            ? ["请提供 'to' 字段或设置 TEST_EMAIL 环境变量"]
            : [
                "1. 检查 Resend API 密钥是否有效",
                "2. 查看服务器日志获取详细错误信息",
                "3. 登录 Resend Dashboard 检查 API 密钥状态",
              ],
        };
      } else if ("ok" in result && result.ok && "id" in result) {
        response.diagnosis = {
          success: true,
          message: "邮件已成功提交到 Resend",
          emailId: result.id,
          nextSteps: [
            "1. 检查收件箱（包括垃圾邮件文件夹）",
            "2. 等待几分钟，邮件可能延迟",
            "3. 登录 Resend Dashboard 查看发送状态",
            `4. 访问: https://resend.com/emails/${result.id}`,
          ],
        };
      }
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("[test/email] Error:", err);
    return res.status(500).json({
      ok: false,
      error: (err as Error).message ?? "Failed to send test email",
    });
  }
}



