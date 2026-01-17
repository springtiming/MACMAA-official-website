import { Resend } from "resend";

// Server-side email helpers used by API routes.

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string | string[] | undefined;
  cc?: string | string[] | undefined;
};

type SendEmailResult = {
  ok: boolean;
  id?: string;
  skipped?: boolean;
  reason?: string;
  error?: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL ?? "VMCA <onboarding@resend.dev>";
const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ??
  process.env.ADMIN_EMAIL ??
  process.env.CONTACT_EMAIL ??
  "";

function normalize(value?: string | string[] | null) {
  if (!value) return [] as string[];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!resendClient) {
    console.warn("[Resend] Missing RESEND_API_KEY, skip send:", input.subject);
    return { ok: false, skipped: true, reason: "missing-api-key" };
  }

  const to = normalize(input.to);
  if (to.length === 0) {
    return { ok: false, skipped: true, reason: "no-recipient" };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: input.from ?? DEFAULT_FROM,
      to,
      subject: input.subject,
      html: input.html,
      cc: normalize(input.cc),
      replyTo: input.replyTo,
    });

    if (error) {
      console.error("[Resend] send failed:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[Resend] send threw:", err);
    return { ok: false, error: (err as Error).message };
  }
}

type MemberApplicationEmailInput = {
  chineseName?: string | null;
  englishName?: string | null;
  email?: string | null;
  phone?: string | null;
  applyDate?: string | null;
};

type MemberRecordLike = {
  chinese_name?: string | null;
  english_name?: string | null;
  email?: string | null;
};

type EventRegistrationEmailInput = {
  eventTitleZh?: string | null;
  eventTitleEn?: string | null;
  name: string;
  email?: string | null;
  tickets?: number;
  paymentMethod?: string | null;
  notes?: string | null;
};

function buildMemberApplicationHtml(payload: MemberApplicationEmailInput) {
  const displayName = payload.chineseName || payload.englishName || "会员申请";
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
      <h2 style="color: #2B5F9E;">${displayName}，您好！</h2>
      <p>您的会员申请已提交成功，我们会在3个工作日内完成审核。</p>
      <p style="margin-top: 12px; color: #6b7280;">
        提交时间：${payload.applyDate ?? "提交时间未记录"}<br/>
        联系电话：${payload.phone ?? "未提供"}<br/>
        邮箱：${payload.email ?? "未提供"}
      </p>
      <p style="margin-top: 16px;">感谢您的支持！</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #111827; font-weight: 600;">Hi ${payload.englishName ?? displayName},</p>
      <p>Your membership application has been received. We will review it within 3 business days.</p>
      <p style="margin-top: 12px; color: #6b7280;">
        Submitted at: ${payload.applyDate ?? "Not captured"}<br/>
        Phone: ${payload.phone ?? "Not provided"}<br/>
        Email: ${payload.email ?? "Not provided"}
      </p>
      <p style="margin-top: 16px;">Thank you for supporting MACMAA!</p>
    </div>
  `;
}

function buildMemberApplicationAdminHtml(payload: MemberApplicationEmailInput) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
      <h3 style="color: #2B5F9E;">新的会员申请</h3>
      <p>申请人：${payload.chineseName ?? payload.englishName ?? "未填写"}</p>
      <p>电话：${payload.phone ?? "未填写"}</p>
      <p>邮箱：${payload.email ?? "未填写"}</p>
      <p>提交时间：${payload.applyDate ?? "未记录"}</p>
      <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-weight: 600;">New membership application</p>
      <p>Name: ${payload.englishName ?? payload.chineseName ?? "N/A"}</p>
      <p>Phone: ${payload.phone ?? "N/A"}</p>
      <p>Email: ${payload.email ?? "N/A"}</p>
      <p>Submitted at: ${payload.applyDate ?? "N/A"}</p>
    </div>
  `;
}

function buildMemberApprovedHtml(member: MemberRecordLike) {
  const displayName = member.chinese_name || member.english_name || "新会员";
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
      <h2 style="color: #2B5F9E;">${displayName}，恭喜您！</h2>
      <p>您的会员申请已通过审核，欢迎加入 MACMAA。</p>
      <p style="margin-top: 16px;">我们期待在接下来的活动中见到您。</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #111827; font-weight: 600;">Dear ${member.english_name ?? displayName},</p>
      <p>Your membership application has been approved. Welcome to MACMAA!</p>
      <p style="margin-top: 16px;">We look forward to seeing you at our events.</p>
    </div>
  `;
}

function buildEventRegistrationHtml(payload: EventRegistrationEmailInput) {
  const title =
    payload.eventTitleZh ||
    payload.eventTitleEn ||
    "活动报名 / Event Registration";
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
      <h2 style="color: #2B5F9E;">${payload.name}，您的报名已确认！</h2>
      <p>活动：${payload.eventTitleZh ?? title}</p>
      <p>人数：${payload.tickets ?? 1}</p>
      ${
        payload.paymentMethod
          ? `<p>支付方式：${payload.paymentMethod}</p>`
          : ""
      }
      ${
        payload.notes
          ? `<p>备注：${payload.notes}</p>`
          : ""
      }
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #111827; font-weight: 600;">Hi ${payload.name}, your registration is confirmed.</p>
      <p>Event: ${payload.eventTitleEn ?? title}</p>
      <p>Tickets: ${payload.tickets ?? 1}</p>
      ${
        payload.paymentMethod
          ? `<p>Payment: ${payload.paymentMethod}</p>`
          : ""
      }
      ${
        payload.notes
          ? `<p>Notes: ${payload.notes}</p>`
          : ""
      }
    </div>
  `;
}

function buildEventRegistrationAdminHtml(payload: EventRegistrationEmailInput) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
      <h3 style="color: #2B5F9E;">新的活动报名</h3>
      <p>活动：${payload.eventTitleZh ?? payload.eventTitleEn ?? "未填写"}</p>
      <p>报名人：${payload.name}</p>
      <p>邮箱：${payload.email ?? "未填写"}</p>
      <p>人数：${payload.tickets ?? 1}</p>
      ${payload.paymentMethod ? `<p>支付方式：${payload.paymentMethod}</p>` : ""}
      ${payload.notes ? `<p>备注：${payload.notes}</p>` : ""}
      <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-weight: 600;">New registration</p>
      <p>Event: ${payload.eventTitleEn ?? payload.eventTitleZh ?? "N/A"}</p>
      <p>Name: ${payload.name}</p>
      <p>Email: ${payload.email ?? "N/A"}</p>
      <p>Tickets: ${payload.tickets ?? 1}</p>
      ${payload.paymentMethod ? `<p>Payment: ${payload.paymentMethod}</p>` : ""}
      ${payload.notes ? `<p>Notes: ${payload.notes}</p>` : ""}
    </div>
  `;
}

export async function sendMemberApplicationSubmitted(
  payload: MemberApplicationEmailInput
) {
  const results: { user?: SendEmailResult; admin?: SendEmailResult } = {};

  if (payload.email) {
    results.user = await sendEmail({
      to: payload.email,
      subject: "MACMAA 会员申请已提交 / Membership Application Received",
      html: buildMemberApplicationHtml(payload),
    });
  }

  if (ADMIN_EMAIL) {
    results.admin = await sendEmail({
      to: ADMIN_EMAIL,
      subject: "New member application received",
      html: buildMemberApplicationAdminHtml(payload),
    });
  }

  return results;
}

export async function sendMemberApprovedEmail(member: MemberRecordLike) {
  if (!member.email) {
    return { ok: false, skipped: true, reason: "no-recipient" } as SendEmailResult;
  }
  return sendEmail({
    to: member.email,
    subject: "MACMAA 会员申请通过 / Membership Approved",
    html: buildMemberApprovedHtml(member),
  });
}

export async function sendEventRegistrationEmails(
  payload: EventRegistrationEmailInput,
  options?: { sendNotesToAdmin?: boolean }
) {
  const results: { user?: SendEmailResult; admin?: SendEmailResult } = {};

  if (payload.email) {
    results.user = await sendEmail({
      to: payload.email,
      subject: "活动报名确认 / Event Registration Confirmed",
      html: buildEventRegistrationHtml(payload),
    });
  }

  if (ADMIN_EMAIL && options?.sendNotesToAdmin && payload.notes) {
    results.admin = await sendEmail({
      to: ADMIN_EMAIL,
      subject: "新活动报名含备注 / New Registration with Notes",
      html: buildEventRegistrationAdminHtml(payload),
    });
  }

  return results;
}

export const emailConfig = {
  adminEmail: ADMIN_EMAIL,
  defaultFrom: DEFAULT_FROM,
  hasApiKey: Boolean(RESEND_API_KEY),
};
