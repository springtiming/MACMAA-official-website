type PaymentReviewDecision = "approve" | "reject";
type TranslationFn = (key: string) => string;

type PaymentReviewConfirmCopy = {
  title: string;
  message: string;
};

type PaymentReviewFeedbackMessages = {
  processingTitle: string;
  processingMessage: string;
  successTitle: string;
  successMessage: string;
  errorTitle: string;
  errorMessage: string;
};

export type { PaymentReviewDecision, PaymentReviewFeedbackMessages };

export function mapPaymentDecisionToStatus(
  decision: PaymentReviewDecision
): "confirmed" | "cancelled" {
  return decision === "approve" ? "confirmed" : "cancelled";
}

export function buildPaymentReviewConfirmCopy(
  t: TranslationFn,
  decision: PaymentReviewDecision
): PaymentReviewConfirmCopy {
  const keyBase = `admin.events.confirm.reviewPayments.${decision}`;
  return {
    title: t(`${keyBase}.title`),
    message: t(`${keyBase}.message`),
  };
}

export function buildPaymentReviewFeedbackMessages(
  t: TranslationFn,
  decision: PaymentReviewDecision
): PaymentReviewFeedbackMessages {
  const keyBase = `admin.events.feedback.reviewPayments.${decision}`;
  return {
    processingTitle: t(`${keyBase}.processingTitle`),
    processingMessage: t(`${keyBase}.processingMessage`),
    successTitle: t(`${keyBase}.successTitle`),
    successMessage: t(`${keyBase}.successMessage`),
    errorTitle: t(`${keyBase}.errorTitle`),
    errorMessage: t(`${keyBase}.errorMessage`),
  };
}
