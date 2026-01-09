/**
 * 会员优惠价格计算工具
 *
 * 规则：会员优惠只适用于1张票，其余票按原价计算
 * 例如：购买5张票时，总价 = 1×会员价 + 4×原价
 */

export type MemberPricingInput = {
  /** 活动原价（单价） */
  regularPrice: number;
  /** 会员价（单价），如果没有会员价则为 null */
  memberPrice: number | null;
  /** 购买票数 */
  tickets: number;
  /** 是否已验证为会员 */
  isMemberVerified: boolean;
};

export type MemberPricingResult = {
  /** 总费用 */
  totalFee: number;
  /** 是否有会员优惠可用 */
  hasMemberDiscount: boolean;
  /** 是否应用了会员优惠 */
  memberDiscountApplied: boolean;
  /** 节省金额（只节省1张票的差价） */
  savings: number;
  /** 会员价单票价格 */
  memberFeePerTicket: number;
  /** 原价单票价格 */
  regularFeePerTicket: number;
};

/**
 * 计算会员优惠价格
 *
 * @param input - 价格计算输入参数
 * @returns 价格计算结果
 *
 * @example
 * // 非会员购买3张票，原价100
 * calculateMemberPricing({
 *   regularPrice: 100,
 *   memberPrice: 50,
 *   tickets: 3,
 *   isMemberVerified: false,
 * });
 * // => { totalFee: 300, hasMemberDiscount: true, memberDiscountApplied: false, savings: 50 }
 *
 * @example
 * // 会员购买3张票，原价100，会员价50
 * calculateMemberPricing({
 *   regularPrice: 100,
 *   memberPrice: 50,
 *   tickets: 3,
 *   isMemberVerified: true,
 * });
 * // => { totalFee: 250 (1×50 + 2×100), hasMemberDiscount: true, memberDiscountApplied: true, savings: 50 }
 */
export function calculateMemberPricing(
  input: MemberPricingInput
): MemberPricingResult {
  const { regularPrice, memberPrice, tickets, isMemberVerified } = input;

  const regularFeePerTicket = Number(regularPrice) || 0;
  const memberFeePerTicket =
    memberPrice != null ? Number(memberPrice) : regularFeePerTicket;

  // 检查是否有会员优惠（会员价低于原价）
  const hasMemberDiscount =
    regularFeePerTicket > 0 &&
    memberPrice != null &&
    memberFeePerTicket < regularFeePerTicket;

  // 是否应用会员优惠
  const memberDiscountApplied = hasMemberDiscount && isMemberVerified;

  // 计算总费用
  // 会员优惠只适用于1张票，其余按原价
  const totalFee = memberDiscountApplied
    ? memberFeePerTicket + (tickets - 1) * regularFeePerTicket
    : tickets * regularFeePerTicket;

  // 节省金额：只节省1张票的差价
  const savings = hasMemberDiscount
    ? regularFeePerTicket - memberFeePerTicket
    : 0;

  return {
    totalFee,
    hasMemberDiscount,
    memberDiscountApplied,
    savings,
    memberFeePerTicket,
    regularFeePerTicket,
  };
}

/**
 * Stripe 手续费计算常量
 */
export const STRIPE_FEE_RATE = 0.017; // 1.7%
export const STRIPE_FEE_FIXED = 0.3; // $0.30 AUD

/**
 * 计算包含 Stripe 手续费的总金额
 *
 * 使用逆向计算公式确保协会收到原价：
 * totalWithFee = (原价 + 固定费) / (1 - 费率)
 *
 * @param amount - 原始金额
 * @returns 包含手续费的总金额
 */
export function calculateTotalWithStripeFee(amount: number): number {
  if (amount <= 0) return 0;
  return Number(
    ((amount + STRIPE_FEE_FIXED) / (1 - STRIPE_FEE_RATE)).toFixed(2)
  );
}

/**
 * 计算 Stripe 手续费
 *
 * @param amount - 原始金额
 * @returns 手续费金额
 */
export function calculateStripeFee(amount: number): number {
  if (amount <= 0) return 0;
  const totalWithFee = calculateTotalWithStripeFee(amount);
  return Number((totalWithFee - amount).toFixed(2));
}
