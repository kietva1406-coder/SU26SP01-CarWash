'use client';

import { useState } from 'react';
import { Star, Gift, TrendingUp, History, Info, Award, ChevronRight, XCircle, Clock, Percent, AlertTriangle, Cake, Crown, Gem, Diamond, Tag, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/contexts/booking-context';
import { MOCK_LOYALTY_TRANSACTIONS, MOCK_SERVICES, MOCK_RANK_CONFIGS } from '@/lib/mock-data';
import { LoyaltyTransaction, EXTENDED_LOYALTY_CONFIG, ExtendedLoyaltyTier } from '@/lib/types';
import { 
  getCustomerLoyaltySummary, 
  formatPoints,
} from '@/lib/loyalty';
import { calculateTierFromPoints, getPointsToNextTier, getTierInfo } from '@/lib/discount-calculator';

const TRANSACTION_TYPE_LABELS: Record<LoyaltyTransaction['type'], string> = {
  EARN: 'Nhận điểm',
  REDEEM: 'Đổi điểm',
  EXPIRE: 'Hết hạn',
  ADJUSTMENT: 'Điều chỉnh',
};

const TRANSACTION_TYPE_COLORS: Record<LoyaltyTransaction['type'], string> = {
  EARN: 'text-green-600 bg-green-50',
  REDEEM: 'text-blue-600 bg-blue-50',
  EXPIRE: 'text-red-600 bg-red-50',
  ADJUSTMENT: 'text-amber-600 bg-amber-50',
};

export default function CustomerLoyaltyView() {
  const { user } = useAuth();
  const { refundVouchers, getRefundVouchersByCustomer } = useBookings();
  const [transactions] = useState<LoyaltyTransaction[]>(MOCK_LOYALTY_TRANSACTIONS);

  if (!user) return null;

  // Get customer loyalty summary
  const loyaltySummary = getCustomerLoyaltySummary(user.id, transactions);
  
  // Calculate tier using extended 6-tier system
  const customerTier = calculateTierFromPoints(loyaltySummary.lifetimePoints);
  const tierInfo = getTierInfo(customerTier);
  const nextTierInfo = getPointsToNextTier(loyaltySummary.lifetimePoints);
  
  // Get customer's transactions
  const myTransactions = transactions
    .filter(t => t.customerId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Get refund vouchers
  const myRefundVouchers = getRefundVouchersByCustomer(user.id);

  return (
    <div className="space-y-6">
      {/* Business Rules Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-purple-500" />
          <h4 className="font-semibold text-purple-700">Loyalty Rules</h4>
        </div>
        <ul className="text-sm text-purple-600 space-y-1">
          <li>BR-A29: Lưu lịch sử loyalty point</li>
          <li>BR-A30: Chỉ cộng điểm sau khi hoàn thành dịch vụ</li>
          <li>BR-A31: Không cộng điểm cho booking bị hủy</li>
          <li>BR-A32: Không cộng điểm cho booking hết hạn</li>
        </ul>
      </div>

      {/* Loyalty Summary Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-indigo-200 text-sm mb-1">Tổng điểm hiện tại</div>
            <div className="text-4xl font-bold">{formatPoints(loyaltySummary.totalPoints)}</div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${tierInfo.bgColor}`}>
            <div className="flex items-center gap-2">
              <Award className={`w-5 h-5 ${tierInfo.color}`} />
              <span className={`font-bold ${tierInfo.color}`}>{tierInfo.name}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{formatPoints(loyaltySummary.lifetimePoints)}</div>
            <div className="text-xs text-indigo-200">Tổng điểm đã nhận</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{loyaltySummary.transactionCount}</div>
            <div className="text-xs text-indigo-200">Lần sử dụng dịch vụ</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">x{tierInfo.multiplier}</div>
            <div className="text-xs text-indigo-200">Hệ số nhân điểm</div>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTierInfo.nextTier && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{tierInfo.name}</span>
              <span>{getTierInfo(nextTierInfo.nextTier).name}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${Math.min(nextTierInfo.progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-indigo-200 mt-1 text-center">
              Còn {formatPoints(nextTierInfo.pointsNeeded)} điểm để lên hạng {getTierInfo(nextTierInfo.nextTier).name}
            </div>
          </div>
        )}
        {!nextTierInfo.nextTier && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg">
              <Diamond className="w-5 h-5" />
              <span className="font-medium">Bạn đã đạt hạng cao nhất!</span>
            </div>
          </div>
        )}
      </div>

      {/* Tier Benefits - Extended 6 tiers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Quyền lợi theo hạng (6 cấp)
        </h3>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {MOCK_RANK_CONFIGS.map(rankConfig => {
            const isCurrentTier = rankConfig.tier === customerTier;
            return (
              <div 
                key={rankConfig.tier}
                className={`p-3 rounded-lg border-2 ${
                  isCurrentTier 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-slate-200'
                }`}
              >
                <div className={`flex items-center gap-1.5 mb-2 ${rankConfig.color}`}>
                  {rankConfig.tier === 'DIAMOND' && <Diamond className="w-4 h-4" />}
                  {rankConfig.tier === 'PLATINUM' && <Gem className="w-4 h-4" />}
                  {rankConfig.tier === 'GOLD' && <Crown className="w-4 h-4" />}
                  {(rankConfig.tier === 'SILVER' || rankConfig.tier === 'BRONZE' || rankConfig.tier === 'UNRANK') && <Award className="w-4 h-4" />}
                  <span className="font-bold text-sm">{rankConfig.name}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div>x{rankConfig.pointMultiplier}</div>
                  {rankConfig.discountPercent > 0 ? (
                    <div className="flex items-center gap-0.5 text-green-600 font-medium">
                      <Percent className="w-3 h-3" />
                      {rankConfig.discountPercent}%
                    </div>
                  ) : (
                    <div className="text-slate-400">0%</div>
                  )}
                  <div className="text-slate-400 text-[10px]">
                    {rankConfig.tier === 'UNRANK' ? 'Mặc định' : `${formatPoints(rankConfig.minPoints)}đ`}
                  </div>
                </div>
                {isCurrentTier && (
                  <div className="mt-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded text-center font-medium">
                    Hiện tại
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Point Calculation Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-700">
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">Cách tính điểm</span>
        </div>
        <p className="text-sm text-amber-600 mt-2">
          Mỗi {formatPoints(EXTENDED_LOYALTY_CONFIG.pointsPerVND)} VND = 1 điểm cơ bản. 
          Điểm cuối cùng = Điểm cơ bản x Hệ số hạng của bạn (hiện tại x{tierInfo.multiplier}).
        </p>
        <p className="text-xs text-amber-500 mt-1">
          BR-A30: Điểm chỉ được cộng sau khi dịch vụ hoàn thành.
        </p>
      </div>

      {/* Tier Upgrade Requirements - Extended */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 mb-3">
          <Award className="w-5 h-5" />
          <span className="font-medium">Yêu cầu lên hạng (6 cấp)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          {MOCK_RANK_CONFIGS.slice(1).map((config, index) => {
            const prevConfig = MOCK_RANK_CONFIGS[index];
            const pointsDiff = config.minPoints - prevConfig.minPoints;
            return (
              <div key={config.tier} className="bg-white rounded-lg p-2.5">
                <div className={`font-medium ${config.color} text-xs`}>
                  {prevConfig.name} → {config.name}
                </div>
                <div className="text-slate-600 text-xs">+{formatPoints(pointsDiff)} điểm</div>
                {config.discountPercent > 0 && (
                  <div className="text-green-600 text-[10px] mt-0.5">Giảm {config.discountPercent}%</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inactivity Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Cảnh báo duy trì hạng</span>
        </div>
        <p className="text-sm text-red-600">
          Nếu không sử dụng dịch vụ trong 1 tháng, bạn sẽ bị trừ <strong>100 điểm</strong>. 
          Tháng tiếp theo không sử dụng sẽ bị trừ <strong>gấp đôi</strong> số điểm lần trước.
        </p>
        <div className="mt-2 text-xs text-red-500">
          Ví dụ: Tháng 1 (-100đ) → Tháng 2 (-200đ) → Tháng 3 (-400đ)...
        </div>
      </div>

      {/* Birthday Voucher Info */}
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-pink-700">
          <Cake className="w-5 h-5" />
          <span className="font-medium">Quà tặng sinh nhật</span>
        </div>
        <p className="text-sm text-pink-600 mt-2">
          Vào tháng sinh nhật, bạn sẽ nhận được voucher giảm giá đặc biệt từ Admin. 
          Hãy đảm bảo cập nhật ngày sinh trong hồ sơ của bạn!
        </p>
      </div>

      {/* Refund Vouchers Section */}
      {myRefundVouchers.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Voucher hoàn tiền ({myRefundVouchers.length})
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Tiền từ các đơn hủy đã được chuyển thành voucher
            </p>
          </div>
          <div className="divide-y divide-slate-200">
            {myRefundVouchers.map((voucher) => (
              <div key={voucher.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Tag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-green-700">{voucher.code}</div>
                      <div className="text-sm text-slate-500">{voucher.description}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Từ booking: {voucher.bookingId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.amount)}
                    </div>
                    <div className="text-xs text-slate-400">
                      HSD: {new Date(voucher.validUntil).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-green-50 border-t border-green-100 text-center">
            <p className="text-xs text-green-600">
              <Info className="w-3 h-3 inline mr-1" />
              Sử dụng mã voucher khi đặt lịch để được giảm giá
            </p>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            Lịch sử điểm thưởng (BR-A29)
          </h3>
        </div>
        
        {myTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Gift className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Chưa có giao dịch nào</p>
            <p className="text-sm mt-1">Hoàn thành dịch vụ để nhận điểm thưởng</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {myTransactions.map(transaction => (
              <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${TRANSACTION_TYPE_COLORS[transaction.type]}`}>
                      {transaction.type === 'EARN' && <TrendingUp className="w-5 h-5" />}
                      {transaction.type === 'REDEEM' && <Gift className="w-5 h-5" />}
                      {transaction.type === 'EXPIRE' && <XCircle className="w-5 h-5" />}
                      {transaction.type === 'ADJUSTMENT' && <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {TRANSACTION_TYPE_LABELS[transaction.type]}
                      </div>
                      <div className="text-sm text-slate-500">{transaction.description}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Booking: {transaction.bookingId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      transaction.type === 'EARN' || 
                      (transaction.type === 'ADJUSTMENT' && transaction.points > 0)
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'EARN' || 
                       (transaction.type === 'ADJUSTMENT' && transaction.points > 0) 
                        ? '+' : '-'}
                      {formatPoints(Math.abs(transaction.points))}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {transaction.completedAt && (
                      <div className="text-xs text-green-500 mt-1">BR-A30: Đã hoàn thành</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rules Explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-semibold text-slate-700 mb-2">Lưu ý quan trọng:</h4>
        <ul className="text-sm text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span><strong>BR-A30:</strong> Điểm chỉ được cộng sau khi dịch vụ hoàn thành. Booking đang xử lý chưa nhận được điểm.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span><strong>BR-A31:</strong> Booking bị hủy sẽ không nhận được điểm thưởng.</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span><strong>BR-A32:</strong> Booking hết hạn (không check-in đúng giờ) sẽ không nhận được điểm thưởng.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
