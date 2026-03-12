export type ReviewLogModule = "member_review" | "payment_review";
export type ReviewLogLanguage = "zh" | "en";

const actionLabels: Record<string, { zh: string; en: string }> = {
  approve: { zh: "审核通过", en: "Approved" },
  reject: { zh: "拒绝申请", en: "Rejected" },
  revoke: { zh: "撤销资格", en: "Revoked" },
  reopen: { zh: "重新开启", en: "Reopened" },
  status_update: { zh: "状态更新", en: "Status Updated" },
};

const memberStatusLabels: Record<string, { zh: string; en: string }> = {
  pending: { zh: "待审核", en: "Pending" },
  approved: { zh: "已通过", en: "Approved" },
  rejected: { zh: "已拒绝", en: "Rejected" },
};

const paymentStatusLabels: Record<string, { zh: string; en: string }> = {
  pending: { zh: "待审核", en: "Pending" },
  confirmed: { zh: "已通过", en: "Confirmed" },
  expired: { zh: "已过期", en: "Expired" },
  cancelled: { zh: "已取消", en: "Cancelled" },
};

export function getReviewActionLabel(
  actionType: string,
  language: ReviewLogLanguage
): string {
  return actionLabels[actionType]?.[language] ?? actionType;
}

export function getReviewStatusLabel(
  module: ReviewLogModule,
  status: string | null,
  language: ReviewLogLanguage
): string {
  if (!status) return "-";
  const labels =
    module === "member_review" ? memberStatusLabels : paymentStatusLabels;
  return labels[status]?.[language] ?? status;
}
