import { describe, expect, it } from "vitest";
import {
  buildPaymentReviewConfirmCopy,
  buildPaymentReviewFeedbackMessages,
  mapPaymentDecisionToStatus,
} from "../paymentReviewFeedback";

describe("paymentReviewFeedback", () => {
  const zhDict: Record<string, string> = {
    "admin.events.confirm.reviewPayments.approve.title": "确认通过付款",
    "admin.events.confirm.reviewPayments.approve.message":
      "确定要通过该付款凭证吗？",
    "admin.events.confirm.reviewPayments.reject.title": "确认拒绝付款",
    "admin.events.confirm.reviewPayments.reject.message":
      "确定要拒绝该付款凭证吗？",
    "admin.events.feedback.reviewPayments.approve.processingTitle":
      "正在通过付款审核...",
    "admin.events.feedback.reviewPayments.approve.processingMessage":
      "正在更新付款状态",
    "admin.events.feedback.reviewPayments.approve.successTitle": "审核已通过",
    "admin.events.feedback.reviewPayments.approve.successMessage":
      "付款状态已更新为已确认",
    "admin.events.feedback.reviewPayments.approve.errorTitle": "审核失败",
    "admin.events.feedback.reviewPayments.approve.errorMessage":
      "无法更新付款状态，请稍后重试",
    "admin.events.feedback.reviewPayments.reject.processingTitle":
      "正在拒绝付款审核...",
    "admin.events.feedback.reviewPayments.reject.processingMessage":
      "正在更新付款状态",
    "admin.events.feedback.reviewPayments.reject.successTitle": "审核已拒绝",
    "admin.events.feedback.reviewPayments.reject.successMessage":
      "付款状态已更新为已取消",
    "admin.events.feedback.reviewPayments.reject.errorTitle": "操作失败",
    "admin.events.feedback.reviewPayments.reject.errorMessage":
      "无法更新付款状态，请稍后重试",
  };

  const t = (key: string) => zhDict[key] ?? key;

  it("maps decisions to payment statuses", () => {
    expect(mapPaymentDecisionToStatus("approve")).toBe("confirmed");
    expect(mapPaymentDecisionToStatus("reject")).toBe("cancelled");
  });

  it("builds localized confirm copy for approve/reject decisions", () => {
    expect(buildPaymentReviewConfirmCopy(t, "approve")).toEqual({
      title: "确认通过付款",
      message: "确定要通过该付款凭证吗？",
    });
    expect(buildPaymentReviewConfirmCopy(t, "reject")).toEqual({
      title: "确认拒绝付款",
      message: "确定要拒绝该付款凭证吗？",
    });
  });

  it("builds localized processing feedback messages for review decisions", () => {
    expect(buildPaymentReviewFeedbackMessages(t, "approve")).toEqual({
      processingTitle: "正在通过付款审核...",
      processingMessage: "正在更新付款状态",
      successTitle: "审核已通过",
      successMessage: "付款状态已更新为已确认",
      errorTitle: "审核失败",
      errorMessage: "无法更新付款状态，请稍后重试",
    });

    expect(buildPaymentReviewFeedbackMessages(t, "reject")).toEqual({
      processingTitle: "正在拒绝付款审核...",
      processingMessage: "正在更新付款状态",
      successTitle: "审核已拒绝",
      successMessage: "付款状态已更新为已取消",
      errorTitle: "操作失败",
      errorMessage: "无法更新付款状态，请稍后重试",
    });
  });
});
