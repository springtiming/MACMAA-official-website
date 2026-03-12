import { describe, expect, it } from "vitest";
import {
  getReviewActionLabel,
  getReviewStatusLabel,
  type ReviewLogModule,
} from "../reviewAuditLog";

describe("reviewAuditLog labels", () => {
  it("maps member actions in zh and en", () => {
    expect(getReviewActionLabel("approve", "zh")).toBe("审核通过");
    expect(getReviewActionLabel("reject", "zh")).toBe("拒绝申请");
    expect(getReviewActionLabel("approve", "en")).toBe("Approved");
    expect(getReviewActionLabel("reopen", "en")).toBe("Reopened");
  });

  it("maps member status labels", () => {
    const module: ReviewLogModule = "member_review";
    expect(getReviewStatusLabel(module, "pending", "zh")).toBe("待审核");
    expect(getReviewStatusLabel(module, "approved", "zh")).toBe("已通过");
    expect(getReviewStatusLabel(module, "rejected", "en")).toBe("Rejected");
  });

  it("maps payment status labels", () => {
    const module: ReviewLogModule = "payment_review";
    expect(getReviewStatusLabel(module, "pending", "zh")).toBe("待审核");
    expect(getReviewStatusLabel(module, "confirmed", "zh")).toBe("已通过");
    expect(getReviewStatusLabel(module, "expired", "en")).toBe("Expired");
    expect(getReviewStatusLabel(module, "cancelled", "en")).toBe("Cancelled");
  });

  it("falls back to original text for unknown values", () => {
    expect(getReviewActionLabel("custom_action", "en")).toBe("custom_action");
    expect(getReviewStatusLabel("member_review", "custom", "zh")).toBe(
      "custom"
    );
  });
});
