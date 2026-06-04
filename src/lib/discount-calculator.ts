import { 
  Voucher, 
  ExtendedLoyaltyTier, 
  DiscountBreakdown, 
  EXTENDED_LOYALTY_CONFIG 
} from './types';
import { calculateVoucherDiscount } from './voucher';

// Calculate total discount with rank and voucher combined
// Order: Rank discount first -> Voucher discount on reduced price
export function calculateTotalDiscount(
  originalPrice: number,
  userTier: ExtendedLoyaltyTier,
  voucher?: Voucher
): DiscountBreakdown {
  // 1. Apply rank discount first
  const rankDiscountPercent = EXTENDED_LOYALTY_CONFIG.tierDiscounts[userTier];
  const rankDiscountAmount = Math.round((originalPrice * rankDiscountPercent) / 100);
  const priceAfterRankDiscount = originalPrice - rankDiscountAmount;
  
  // 2. Apply voucher discount on the already-discounted price
  let voucherDiscountAmount = 0;
  let voucherDiscountPercent: number | undefined;
  let voucherCode: string | undefined;
  
  if (voucher) {
    voucherCode = voucher.code;
    voucherDiscountAmount = calculateVoucherDiscount(voucher, priceAfterRankDiscount);
    
    if (voucher.discountType === 'PERCENT') {
      voucherDiscountPercent = voucher.discountValue;
    } else {
      // For fixed amount, calculate effective percentage
      voucherDiscountPercent = priceAfterRankDiscount > 0 
        ? (voucherDiscountAmount / priceAfterRankDiscount) * 100 
        : 0;
    }
  }
  
  // 3. Calculate totals
  const totalDiscountAmount = rankDiscountAmount + voucherDiscountAmount;
  const finalPrice = originalPrice - totalDiscountAmount;
  const totalDiscountPercent = originalPrice > 0 
    ? (totalDiscountAmount / originalPrice) * 100 
    : 0;
  
  return {
    originalPrice,
    rankTier: userTier,
    rankDiscountPercent,
    rankDiscountAmount,
    priceAfterRankDiscount,
    voucherCode,
    voucherDiscountPercent,
    voucherDiscountAmount,
    totalDiscountAmount,
    totalDiscountPercent: Math.round(totalDiscountPercent * 10) / 10, // Round to 1 decimal
    finalPrice: Math.max(0, finalPrice), // Never negative
  };
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

// Format discount breakdown for display
export function formatDiscountBreakdown(breakdown: DiscountBreakdown): {
  lines: { label: string; value: string; type: 'original' | 'discount' | 'final' }[];
  savings: string;
  savingsPercent: string;
} {
  const lines: { label: string; value: string; type: 'original' | 'discount' | 'final' }[] = [];
  
  // Original price
  lines.push({
    label: 'Giá gốc',
    value: formatCurrency(breakdown.originalPrice),
    type: 'original',
  });
  
  // Rank discount (if any)
  if (breakdown.rankDiscountAmount > 0) {
    lines.push({
      label: `Giảm theo hạng ${getRankName(breakdown.rankTier)} (${breakdown.rankDiscountPercent}%)`,
      value: `-${formatCurrency(breakdown.rankDiscountAmount)}`,
      type: 'discount',
    });
  }
  
  // Voucher discount (if any)
  if (breakdown.voucherDiscountAmount > 0 && breakdown.voucherCode) {
    const voucherLabel = breakdown.voucherDiscountPercent 
      ? `Voucher ${breakdown.voucherCode} (${Math.round(breakdown.voucherDiscountPercent)}%)`
      : `Voucher ${breakdown.voucherCode}`;
    lines.push({
      label: voucherLabel,
      value: `-${formatCurrency(breakdown.voucherDiscountAmount)}`,
      type: 'discount',
    });
  }
  
  // Final price
  lines.push({
    label: 'Tổng thanh toán',
    value: formatCurrency(breakdown.finalPrice),
    type: 'final',
  });
  
  return {
    lines,
    savings: formatCurrency(breakdown.totalDiscountAmount),
    savingsPercent: `${breakdown.totalDiscountPercent}%`,
  };
}

// Get rank name in Vietnamese
function getRankName(tier: ExtendedLoyaltyTier): string {
  const names: Record<ExtendedLoyaltyTier, string> = {
    UNRANK: 'Chưa xếp hạng',
    BRONZE: 'Đồng',
    SILVER: 'Bạc',
    GOLD: 'Vàng',
    PLATINUM: 'Bạch Kim',
    DIAMOND: 'Kim Cương',
  };
  return names[tier];
}

// Preview discount before applying
export function previewDiscount(
  originalPrice: number,
  userTier: ExtendedLoyaltyTier,
  voucher?: Voucher
): {
  breakdown: DiscountBreakdown;
  display: ReturnType<typeof formatDiscountBreakdown>;
} {
  const breakdown = calculateTotalDiscount(originalPrice, userTier, voucher);
  const display = formatDiscountBreakdown(breakdown);
  return { breakdown, display };
}

// Calculate points earned from a purchase
export function calculatePointsEarned(
  finalPrice: number,
  userTier: ExtendedLoyaltyTier
): number {
  const basePoints = Math.floor(finalPrice / EXTENDED_LOYALTY_CONFIG.pointsPerVND);
  const multiplier = EXTENDED_LOYALTY_CONFIG.tierMultipliers[userTier];
  return Math.floor(basePoints * multiplier);
}

// Get tier info for display
export function getTierInfo(tier: ExtendedLoyaltyTier): {
  name: string;
  discount: number;
  multiplier: number;
  threshold: number;
  color: string;
  bgColor: string;
} {
  const colorMap: Record<ExtendedLoyaltyTier, { color: string; bgColor: string }> = {
    UNRANK: { color: 'text-slate-500', bgColor: 'bg-slate-100' },
    BRONZE: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
    SILVER: { color: 'text-slate-600', bgColor: 'bg-slate-200' },
    GOLD: { color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    PLATINUM: { color: 'text-purple-600', bgColor: 'bg-purple-100' },
    DIAMOND: { color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  };
  
  return {
    name: getRankName(tier),
    discount: EXTENDED_LOYALTY_CONFIG.tierDiscounts[tier],
    multiplier: EXTENDED_LOYALTY_CONFIG.tierMultipliers[tier],
    threshold: EXTENDED_LOYALTY_CONFIG.tierThresholds[tier],
    ...colorMap[tier],
  };
}

// Calculate tier from points
export function calculateTierFromPoints(points: number): ExtendedLoyaltyTier {
  if (points >= EXTENDED_LOYALTY_CONFIG.tierThresholds.DIAMOND) return 'DIAMOND';
  if (points >= EXTENDED_LOYALTY_CONFIG.tierThresholds.PLATINUM) return 'PLATINUM';
  if (points >= EXTENDED_LOYALTY_CONFIG.tierThresholds.GOLD) return 'GOLD';
  if (points >= EXTENDED_LOYALTY_CONFIG.tierThresholds.SILVER) return 'SILVER';
  if (points >= EXTENDED_LOYALTY_CONFIG.tierThresholds.BRONZE) return 'BRONZE';
  return 'UNRANK';
}

// Get points needed for next tier
export function getPointsToNextTier(currentPoints: number): {
  nextTier: ExtendedLoyaltyTier | null;
  pointsNeeded: number;
  progress: number;
} {
  const currentTier = calculateTierFromPoints(currentPoints);
  const thresholds = EXTENDED_LOYALTY_CONFIG.tierThresholds;
  
  const tierOrder: ExtendedLoyaltyTier[] = ['UNRANK', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex === tierOrder.length - 1) {
    // Already at max tier
    return {
      nextTier: null,
      pointsNeeded: 0,
      progress: 100,
    };
  }
  
  const nextTier = tierOrder[currentIndex + 1];
  const nextThreshold = thresholds[nextTier];
  const currentThreshold = thresholds[currentTier];
  const pointsNeeded = nextThreshold - currentPoints;
  const progress = ((currentPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  
  return {
    nextTier,
    pointsNeeded,
    progress: Math.min(100, Math.max(0, progress)),
  };
}
