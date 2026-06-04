'use client';

import { useState, useMemo } from 'react';
import { 
  Ticket, 
  Check, 
  X, 
  AlertCircle, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Award,
  Percent,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  Voucher, 
  ExtendedLoyaltyTier, 
  VoucherValidationResult,
  DiscountBreakdown 
} from '@/lib/types';
import { 
  getVouchersForRank, 
  validateVoucher, 
  formatVoucherDiscount,
  getVoucherStatus,
  getRemainingUsage,
  isExpiringSoon,
  getDaysUntilExpiry
} from '@/lib/voucher';
import { 
  calculateTotalDiscount, 
  formatCurrency,
  formatDiscountBreakdown 
} from '@/lib/discount-calculator';

interface VoucherSelectorProps {
  customerId: string;
  customerTier: ExtendedLoyaltyTier;
  orderAmount: number;
  serviceIds: string[];
  selectedVoucher: Voucher | null;
  onVoucherSelect: (voucher: Voucher | null, breakdown: DiscountBreakdown) => void;
}

export function VoucherSelector({
  customerId,
  customerTier,
  orderAmount,
  serviceIds,
  selectedVoucher,
  onVoucherSelect,
}: VoucherSelectorProps) {
  const [inputCode, setInputCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);

  // Get available vouchers for this customer's rank
  const availableVouchers = useMemo(() => {
    return getVouchersForRank(customerTier);
  }, [customerTier]);

  // Calculate current discount breakdown
  const currentBreakdown = useMemo(() => {
    return calculateTotalDiscount(orderAmount, customerTier, selectedVoucher || undefined);
  }, [orderAmount, customerTier, selectedVoucher]);

  // Handle manual code input
  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;

    setIsValidating(true);
    setValidationError(null);
    setValidationSuccess(false);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = validateVoucher(
      inputCode.trim(),
      customerId,
      customerTier,
      orderAmount,
      serviceIds
    );

    setIsValidating(false);

    if (result.valid && result.voucher) {
      setValidationSuccess(true);
      const breakdown = calculateTotalDiscount(orderAmount, customerTier, result.voucher);
      onVoucherSelect(result.voucher, breakdown);
      setInputCode('');
      setTimeout(() => setValidationSuccess(false), 2000);
    } else {
      setValidationError(result.errors[0] || 'Mã voucher không hợp lệ');
    }
  };

  // Handle selecting from list
  const handleSelectFromList = (voucher: Voucher) => {
    const result = validateVoucher(
      voucher.code,
      customerId,
      customerTier,
      orderAmount,
      serviceIds
    );

    if (result.valid) {
      const breakdown = calculateTotalDiscount(orderAmount, customerTier, voucher);
      onVoucherSelect(voucher, breakdown);
      setIsExpanded(false);
      setValidationError(null);
    } else {
      setValidationError(result.errors[0] || 'Voucher không thể áp dụng');
    }
  };

  // Handle remove voucher
  const handleRemoveVoucher = () => {
    const breakdown = calculateTotalDiscount(orderAmount, customerTier, undefined);
    onVoucherSelect(null, breakdown);
    setValidationError(null);
  };

  const displayBreakdown = formatDiscountBreakdown(currentBreakdown);

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-indigo-600" />
          <h3 className="font-medium text-slate-900">Mã giảm giá</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Selected Voucher Display */}
        {selectedVoucher && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-green-800">{selectedVoucher.code}</div>
                <div className="text-sm text-green-600">{formatVoucherDiscount(selectedVoucher)}</div>
              </div>
            </div>
            <button
              onClick={handleRemoveVoucher}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Code Input */}
        {!selectedVoucher && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value.toUpperCase());
                    setValidationError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                  placeholder="Nhập mã giảm giá"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    validationError 
                      ? 'border-red-300 focus:ring-red-500' 
                      : validationSuccess
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                />
                {validationSuccess && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              <button
                onClick={handleApplyCode}
                disabled={!inputCode.trim() || isValidating}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Áp dụng'
                )}
              </button>
            </div>

            {validationError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        )}

        {/* Available Vouchers Toggle */}
        {!selectedVoucher && availableVouchers.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full py-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Xem {availableVouchers.length} voucher khả dụng
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Available Vouchers List */}
            {isExpanded && (
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {availableVouchers.map((voucher) => {
                  const status = getVoucherStatus(voucher);
                  const canApply = validateVoucher(
                    voucher.code,
                    customerId,
                    customerTier,
                    orderAmount,
                    serviceIds
                  ).valid;
                  const expiringSoon = isExpiringSoon(voucher);
                  const daysLeft = getDaysUntilExpiry(voucher);

                  return (
                    <button
                      key={voucher.id}
                      onClick={() => canApply && handleSelectFromList(voucher)}
                      disabled={!canApply}
                      className={`w-full p-3 border rounded-lg text-left transition-all ${
                        canApply
                          ? 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
                          : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-indigo-600">
                              {voucher.code}
                            </span>
                            {expiringSoon && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                <Clock className="w-3 h-3" />
                                {daysLeft} ngày
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-0.5 truncate">
                            {voucher.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              {formatVoucherDiscount(voucher)}
                            </span>
                            {voucher.minOrderValue && voucher.minOrderValue > 0 && (
                              <span>
                                Tối thiểu {formatCurrency(voucher.minOrderValue)}
                              </span>
                            )}
                          </div>
                          {/* Rank requirement */}
                          {voucher.applicableRanks.length > 0 && 
                           voucher.applicableRanks.length < 6 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Award className="w-3 h-3 text-amber-500" />
                              <span className="text-xs text-slate-500">
                                {voucher.applicableRanks.map(r => getRankShortName(r)).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        {canApply && (
                          <div className="flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Discount Summary */}
        {currentBreakdown.totalDiscountAmount > 0 && (
          <div className="pt-3 border-t border-slate-200 space-y-2">
            {displayBreakdown.lines.map((line, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between text-sm ${
                  line.type === 'final' 
                    ? 'font-semibold text-slate-900 pt-2 border-t border-slate-100' 
                    : line.type === 'discount'
                      ? 'text-green-600'
                      : 'text-slate-600'
                }`}
              >
                <span>{line.label}</span>
                <span>{line.value}</span>
              </div>
            ))}
            {currentBreakdown.totalDiscountAmount > 0 && (
              <div className="flex items-center justify-center gap-2 mt-2 py-2 bg-green-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Tiết kiệm {displayBreakdown.savings} ({displayBreakdown.savingsPercent})
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function
function getRankShortName(tier: ExtendedLoyaltyTier): string {
  const names: Record<ExtendedLoyaltyTier, string> = {
    UNRANK: 'Mới',
    BRONZE: 'Đồng',
    SILVER: 'Bạc',
    GOLD: 'Vàng',
    PLATINUM: 'Bạch Kim',
    DIAMOND: 'Kim Cương',
  };
  return names[tier];
}

export default VoucherSelector;
