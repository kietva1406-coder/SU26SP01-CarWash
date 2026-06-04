import { 
  Booking, 
  LoyaltyTransaction, 
  CustomerLoyalty, 
  Service,
  ValidationResult,
  ValidationError,
  LOYALTY_CONFIG,
  BUSINESS_RULES
} from './types';

// Generate unique loyalty transaction ID
export function generateLoyaltyTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `LT${timestamp}${random}`;
}

// Calculate points for a booking based on services
export function calculateBookingPoints(
  booking: Booking, 
  services: Service[],
  customerTier: CustomerLoyalty['tier'] = 'BRONZE'
): number {
  const selectedServices = services.filter(s => booking.serviceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const basePoints = Math.floor(totalPrice / LOYALTY_CONFIG.pointsPerVND);
  const multiplier = LOYALTY_CONFIG.tierMultipliers[customerTier];
  return Math.floor(basePoints * multiplier);
}

// BR-A30, BR-A31, BR-A32: Validate if booking can earn loyalty points
export function canEarnLoyaltyPoints(booking: Booking): ValidationResult {
  const errors: ValidationError[] = [];
  
  // BR-A30: Chỉ cộng điểm sau completion
  if (booking.status !== 'COMPLETED') {
    errors.push({
      rule: 'BR-A30',
      message: BUSINESS_RULES['BR-A30']
    });
  }
  
  // BR-A31: Không cộng điểm cho booking canceled
  if (booking.status === 'CANCELLED') {
    errors.push({
      rule: 'BR-A31',
      message: BUSINESS_RULES['BR-A31']
    });
  }
  
  // BR-A32: Không cộng điểm cho booking expired
  if (booking.status === 'EXPIRED') {
    errors.push({
      rule: 'BR-A32',
      message: BUSINESS_RULES['BR-A32']
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// BR-A29: Create loyalty transaction for completed booking
export function createLoyaltyTransaction(
  booking: Booking,
  points: number,
  services: Service[]
): LoyaltyTransaction | null {
  // Validate booking can earn points
  const validation = canEarnLoyaltyPoints(booking);
  if (!validation.valid) {
    return null;
  }
  
  const serviceNames = services
    .filter(s => booking.serviceIds.includes(s.id))
    .map(s => s.name)
    .join(', ');
  
  return {
    id: generateLoyaltyTransactionId(),
    customerId: booking.customerId,
    bookingId: booking.id,
    points,
    type: 'EARN',
    description: `Điểm thưởng cho booking ${booking.id}: ${serviceNames}`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(), // BR-A30: Points added at completion
  };
}

// Calculate customer tier based on lifetime points
// Unrank -> Đồng: 100 điểm
// Đồng -> Bạc: 200 điểm thêm (tổng 300)
// Bạc -> Vàng: 400 điểm thêm (tổng 700)
export function calculateCustomerTier(lifetimePoints: number): CustomerLoyalty['tier'] {
  if (lifetimePoints >= LOYALTY_CONFIG.tierThresholds.GOLD) {
    return 'GOLD';
  }
  if (lifetimePoints >= LOYALTY_CONFIG.tierThresholds.SILVER) {
    return 'SILVER';
  }
  if (lifetimePoints >= LOYALTY_CONFIG.tierThresholds.BRONZE) {
    return 'BRONZE';
  }
  return 'UNRANK';
}

// Get points needed to reach next tier
export function getPointsToNextTier(currentPoints: number, currentTier: CustomerLoyalty['tier']): number {
  switch (currentTier) {
    case 'UNRANK':
      return LOYALTY_CONFIG.tierThresholds.BRONZE - currentPoints;
    case 'BRONZE':
      return LOYALTY_CONFIG.tierThresholds.SILVER - currentPoints;
    case 'SILVER':
      return LOYALTY_CONFIG.tierThresholds.GOLD - currentPoints;
    case 'GOLD':
      return 0; // Already at max tier
    default:
      return 0;
  }
}

// Calculate points decay for inactivity
// Month 1: -100 points, Month 2: -200, Month 3: -400, etc.
export function calculateInactivityDecay(monthsInactive: number): number {
  if (monthsInactive <= 0) return 0;
  
  let totalDecay = 0;
  let currentDecay = LOYALTY_CONFIG.inactivityDecay.firstMonth;
  
  for (let i = 0; i < monthsInactive; i++) {
    totalDecay += currentDecay;
    currentDecay *= LOYALTY_CONFIG.inactivityDecay.subsequentMultiplier;
  }
  
  return totalDecay;
}

// Calculate discount for a tier
export function getTierDiscount(tier: CustomerLoyalty['tier']): number {
  return LOYALTY_CONFIG.tierDiscounts[tier];
}

// Apply tier discount to price
export function applyTierDiscount(price: number, tier: CustomerLoyalty['tier']): number {
  const discount = getTierDiscount(tier);
  return price * (1 - discount / 100);
}

// Get customer loyalty summary from transactions
export function getCustomerLoyaltySummary(
  customerId: string, 
  transactions: LoyaltyTransaction[]
): CustomerLoyalty {
  const customerTransactions = transactions.filter(
    t => t.customerId === customerId && t.status === 'COMPLETED'
  );
  
  let totalPoints = 0;
  let lifetimePoints = 0;
  
  for (const transaction of customerTransactions) {
    if (transaction.type === 'EARN') {
      totalPoints += transaction.points;
      lifetimePoints += transaction.points;
    } else if (transaction.type === 'REDEEM') {
      totalPoints -= transaction.points;
    } else if (transaction.type === 'EXPIRE') {
      totalPoints -= transaction.points;
    } else if (transaction.type === 'ADJUSTMENT') {
      totalPoints += transaction.points;
      if (transaction.points > 0) {
        lifetimePoints += transaction.points;
      }
    }
  }
  
  // Ensure points don't go negative
  totalPoints = Math.max(0, totalPoints);
  
  return {
    customerId,
    totalPoints,
    lifetimePoints,
    tier: calculateCustomerTier(lifetimePoints),
    transactionCount: customerTransactions.filter(t => t.type === 'EARN').length,
  };
}

// Check if booking already has loyalty points awarded
export function hasLoyaltyPointsAwarded(
  bookingId: string, 
  transactions: LoyaltyTransaction[]
): boolean {
  return transactions.some(
    t => t.bookingId === bookingId && 
         t.type === 'EARN' && 
         t.status === 'COMPLETED'
  );
}

// Get tier display info
export function getTierDisplayInfo(tier: CustomerLoyalty['tier']): {
  name: string;
  color: string;
  bgColor: string;
  nextTier: CustomerLoyalty['tier'] | null;
  pointsToNextTier: number;
  discount: number;
} {
  const tierInfo: Record<CustomerLoyalty['tier'], { name: string; color: string; bgColor: string }> = {
    UNRANK: { name: 'Chưa xếp hạng', color: 'text-slate-500', bgColor: 'bg-slate-100' },
    BRONZE: { name: 'Đồng', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    SILVER: { name: 'Bạc', color: 'text-slate-600', bgColor: 'bg-slate-200' },
    GOLD: { name: 'Vàng', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  };
  
  const nextTierMap: Record<CustomerLoyalty['tier'], CustomerLoyalty['tier'] | null> = {
    UNRANK: 'BRONZE',
    BRONZE: 'SILVER',
    SILVER: 'GOLD',
    GOLD: null,
  };
  
  const info = tierInfo[tier];
  const nextTier = nextTierMap[tier];
  const currentThreshold = LOYALTY_CONFIG.tierThresholds[tier];
  const nextThreshold = nextTier ? LOYALTY_CONFIG.tierThresholds[nextTier] : 0;
  
  return {
    ...info,
    nextTier,
    pointsToNextTier: nextTier ? nextThreshold - currentThreshold : 0,
    discount: LOYALTY_CONFIG.tierDiscounts[tier],
  };
}

// Format points display
export function formatPoints(points: number): string {
  return points.toLocaleString('vi-VN');
}
