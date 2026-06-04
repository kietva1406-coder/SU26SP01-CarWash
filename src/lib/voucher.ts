import { Voucher, VoucherValidationResult, VoucherUsage, ExtendedLoyaltyTier, EXTENDED_LOYALTY_CONFIG } from './types';
import { MOCK_VOUCHERS, MOCK_VOUCHER_USAGES } from './mock-data';

// Get voucher by code
export function getVoucherByCode(code: string): Voucher | undefined {
  return MOCK_VOUCHERS.find(v => v.code.toUpperCase() === code.toUpperCase());
}

// Get voucher by ID
export function getVoucherById(id: string): Voucher | undefined {
  return MOCK_VOUCHERS.find(v => v.id === id);
}

// Get all active vouchers
export function getActiveVouchers(): Voucher[] {
  const now = new Date();
  return MOCK_VOUCHERS.filter(v => {
    if (!v.isActive) return false;
    const validFrom = new Date(v.validFrom);
    const validUntil = new Date(v.validUntil);
    return now >= validFrom && now <= validUntil;
  });
}

// Get vouchers available for a specific rank
export function getVouchersForRank(tier: ExtendedLoyaltyTier): Voucher[] {
  return getActiveVouchers().filter(v => 
    v.applicableRanks.length === 0 || v.applicableRanks.includes(tier)
  );
}

// Get voucher usage count for a specific customer
export function getCustomerVoucherUsageCount(voucherId: string, customerId: string): number {
  return MOCK_VOUCHER_USAGES.filter(
    u => u.voucherId === voucherId && u.customerId === customerId
  ).length;
}

// Validate a voucher for a customer and order
export function validateVoucher(
  code: string,
  customerId: string,
  customerTier: ExtendedLoyaltyTier,
  orderAmount: number,
  serviceIds?: string[]
): VoucherValidationResult {
  const errors: string[] = [];
  
  // 1. Check if voucher exists
  const voucher = getVoucherByCode(code);
  if (!voucher) {
    return {
      valid: false,
      errors: ['Mã voucher không tồn tại'],
    };
  }
  
  // 2. Check if voucher is active
  if (!voucher.isActive) {
    errors.push('Voucher đã bị vô hiệu hóa');
  }
  
  // 3. Check date validity
  const now = new Date();
  const validFrom = new Date(voucher.validFrom);
  const validUntil = new Date(voucher.validUntil);
  
  if (now < validFrom) {
    errors.push(`Voucher chưa có hiệu lực. Bắt đầu từ ${formatDate(validFrom)}`);
  }
  
  if (now > validUntil) {
    errors.push(`Voucher đã hết hạn từ ${formatDate(validUntil)}`);
  }
  
  // 4. Check usage limit
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
    errors.push('Voucher đã hết lượt sử dụng');
  }
  
  // 5. Check per user limit
  if (voucher.perUserLimit > 0) {
    const userUsageCount = getCustomerVoucherUsageCount(voucher.id, customerId);
    if (userUsageCount >= voucher.perUserLimit) {
      errors.push(`Bạn đã sử dụng voucher này ${userUsageCount}/${voucher.perUserLimit} lần`);
    }
  }
  
  // 6. Check rank eligibility
  if (voucher.applicableRanks.length > 0 && !voucher.applicableRanks.includes(customerTier)) {
    const rankNames = voucher.applicableRanks.map(r => getRankName(r)).join(', ');
    errors.push(`Voucher chỉ áp dụng cho thành viên: ${rankNames}`);
  }
  
  // 7. Check minimum order value
  if (voucher.minOrderValue && orderAmount < voucher.minOrderValue) {
    errors.push(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrderValue)} để sử dụng voucher này`);
  }
  
  // 8. Check applicable services (if specified)
  if (voucher.applicableServices && voucher.applicableServices.length > 0 && serviceIds) {
    const hasApplicableService = serviceIds.some(sid => 
      voucher.applicableServices!.includes(sid)
    );
    if (!hasApplicableService) {
      errors.push('Voucher không áp dụng cho các dịch vụ đã chọn');
    }
  }
  
  if (errors.length > 0) {
    return {
      valid: false,
      voucher,
      errors,
    };
  }
  
  // Calculate discount
  const discountAmount = calculateVoucherDiscount(voucher, orderAmount);
  
  return {
    valid: true,
    voucher,
    discountAmount,
    errors: [],
  };
}

// Calculate voucher discount amount
export function calculateVoucherDiscount(voucher: Voucher, orderAmount: number): number {
  let discountAmount: number;
  
  if (voucher.discountType === 'PERCENT') {
    discountAmount = (orderAmount * voucher.discountValue) / 100;
    // Apply max discount cap if exists
    if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
      discountAmount = voucher.maxDiscountAmount;
    }
  } else {
    // FIXED_AMOUNT
    discountAmount = voucher.discountValue;
    // Don't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }
  }
  
  return Math.round(discountAmount);
}

// Create voucher usage record
export function createVoucherUsage(
  voucher: Voucher,
  customerId: string,
  bookingId: string,
  originalAmount: number,
  discountAmount: number
): VoucherUsage {
  return {
    id: `VU${Date.now()}`,
    voucherId: voucher.id,
    voucherCode: voucher.code,
    customerId,
    bookingId,
    originalAmount,
    discountAmount,
    finalAmount: originalAmount - discountAmount,
    usedAt: new Date().toISOString(),
  };
}

// Format voucher discount display
export function formatVoucherDiscount(voucher: Voucher): string {
  if (voucher.discountType === 'PERCENT') {
    let text = `Giảm ${voucher.discountValue}%`;
    if (voucher.maxDiscountAmount) {
      text += ` (tối đa ${formatCurrency(voucher.maxDiscountAmount)})`;
    }
    return text;
  }
  return `Giảm ${formatCurrency(voucher.discountValue)}`;
}

// Get voucher status
export function getVoucherStatus(voucher: Voucher): {
  status: 'active' | 'expired' | 'inactive' | 'depleted' | 'upcoming';
  label: string;
  color: string;
  bgColor: string;
} {
  const now = new Date();
  const validFrom = new Date(voucher.validFrom);
  const validUntil = new Date(voucher.validUntil);
  
  if (!voucher.isActive) {
    return {
      status: 'inactive',
      label: 'Vô hiệu',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    };
  }
  
  if (now < validFrom) {
    return {
      status: 'upcoming',
      label: 'Sắp diễn ra',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    };
  }
  
  if (now > validUntil) {
    return {
      status: 'expired',
      label: 'Hết hạn',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    };
  }
  
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
    return {
      status: 'depleted',
      label: 'Hết lượt',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    };
  }
  
  return {
    status: 'active',
    label: 'Đang hoạt động',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  };
}

// Helper functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

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

// Get remaining usage count
export function getRemainingUsage(voucher: Voucher): string {
  if (voucher.usageLimit === 0) return 'Không giới hạn';
  const remaining = voucher.usageLimit - voucher.usedCount;
  return `Còn ${remaining}/${voucher.usageLimit} lượt`;
}

// Check if voucher is expiring soon (within 7 days)
export function isExpiringSoon(voucher: Voucher): boolean {
  const now = new Date();
  const validUntil = new Date(voucher.validUntil);
  const daysRemaining = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysRemaining > 0 && daysRemaining <= 7;
}

// Get days until expiry
export function getDaysUntilExpiry(voucher: Voucher): number {
  const now = new Date();
  const validUntil = new Date(voucher.validUntil);
  return Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
