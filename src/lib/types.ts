// User & Access Types
export type UserRole = 'customer' | 'staff' | 'manager' | 'admin';

export interface User {
  id: string; // BR-A54: Customer ID la duy nhat
  name: string;
  email: string;
  password?: string; // For login authentication
  role: UserRole;
  phone?: string;
  plateNumber?: string; // Primary vehicle plate number for customers
}

// Customer vehicle registration - allows customers to register multiple vehicles
export interface CustomerVehicle {
  id: string;
  customerId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  isPrimary: boolean; // Set as default for bookings
  createdAt: string;
}

// BR-A53: Booking ID là duy nhất
// BR-A48: Mỗi booking thuộc 1 customer
// BR-A08: Booking có start & end time
// BR-A05, BR-A19, BR-A57: Check-in rules
export interface Booking {
  id: string; // BR-A53: Unique booking ID
  customerId: string; // BR-A48: Links to single customer
  plateNumber: string; // BR-A47: Vehicle info required
  vehicleType?: VehicleType; // BR-A47: Additional vehicle info
  services: string[]; // BR-A04: At least 1 service package
  serviceIds: string[]; // BR-A04: Service package IDs
  date: string;
  slotId: string; // BR-A01: Must belong to valid slot
  startTime: string; // BR-A08: Start time
  endTime: string; // BR-A08: End time
  status: BookingStatus;
  isWalkIn: boolean; // BR-A43: Walk-in flag
  queueTicket?: string; // BR-A43: Queue ticket for walk-ins
  checkInTime?: string; // BR-A19: Actual check-in time
  checkOutTime?: string; // BR-A57: Check-out time
  expiresAt?: string; // BR-A12: Expiry time for auto-expire
  rejectionReason?: string; // Lý do từ chối (khi status = REJECTED)
  rejectedBy?: string; // ID nhân viên từ chối
  rejectedAt?: string; // Thời gian từ chối
  completionPhoto?: string; // Ảnh chụp xe sau khi hoàn thành (base64 hoặc URL)
  completionPhotoUploadedAt?: string; // Thời gian upload ảnh
  completionPhotoUploadedBy?: string; // ID nhân viên upload ảnh
  createdAt: string;
  updatedAt: string;
}

// Refund voucher khi khách hàng hủy đơn
export interface RefundVoucher {
  id: string;
  customerId: string;
  bookingId: string; // Booking đã hủy
  code: string;
  amount: number; // Số tiền hoàn lại
  originalAmount: number; // Giá trị đơn gốc
  description: string;
  validFrom: string;
  validUntil: string; // Có hiệu lực 30 ngày
  isUsed: boolean;
  usedAt?: string;
  usedInBookingId?: string;
  createdAt: string;
}

// BR-A12: Booking quá giờ tự động expired
// BR-A14: Booking canceled không phục vụ
// PENDING_CHECKIN: Đợi check-in (khi khách hàng đặt lịch thành công)
// CONFIRMED: Đã xác nhận (sau khi nhân viên check-in)
// REJECTED: Yêu cầu bị từ chối (nhân viên từ chối check-in)
export type BookingStatus = 'PENDING_CHECKIN' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'REJECTED';

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle';

// BR-A02: Slot có giới hạn xe tối đa
// BR-A45: Slot bị khóa không cho booking
// BR-A56: Slot duration phải lớn hơn 0
export interface TimeSlot {
  id: string;
  time: string;
  date: string;
  locked: boolean; // BR-A45: Locked slots can't be booked
  maxCapacity: number; // BR-A02: Max vehicle limit
  currentBookings: number; // BR-A03: Track current bookings
  duration: number; // BR-A56: Slot duration in minutes (must be > 0)
}

// BR-A21: Service package có estimated duration
// BR-A22: Mỗi package có mã định danh riêng
// BR-A55: Service duration không được âm
export interface Service {
  id: string; // BR-A22: Unique identifier
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  duration: number; // BR-A21: Estimated duration (BR-A55: cannot be negative)
  active: boolean;
  minSlotDuration?: number; // BR-A56: Minimum slot duration required
}

// Combo/Package type for bundled services
export interface Combo {
  id: string;
  name: string;
  description: string;
  services: string[]; // Array of service IDs
  totalPrice: number;
  totalPriceDisplay: string;
  totalDuration: number; // Combined duration of all services
  discount?: number; // Optional discount percentage
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Business Rules Permission Types
export interface Permission {
  canEditSlots: boolean;        // BR-A24
  canUpdateServiceStatus: boolean; // BR-A25
  canViewDashboard: boolean;    // BR-A26
  canViewAllBookings: boolean;  // BR-A27 (inverse)
  canManageServices: boolean;   // BR-A23
  canManageUsers: boolean;      // Manage employees (staff)
  canManageCustomers: boolean;  // Manage customer list (admin only)
  canCreateWalkIn: boolean;     // BR-A43
}

// Validation Result Type
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  rule: string;
  message: string;
  field?: string;
}

// Business Rules Constants - All Rules
export const BUSINESS_RULES = {
  // User & Access Rules
  'BR-A24': 'Chỉ admin/manager chỉnh sửa slot',
  'BR-A25': 'Staff chỉ cập nhật trạng thái service',
  'BR-A26': 'Manager xem dashboard tổng hợp',
  'BR-A27': 'Customer chỉ xem booking của mình',
  'BR-A54': 'Customer ID là duy nhất',
  
  // Booking Validation Rules
  'BR-A01': 'Booking phải thuộc slot hợp lệ',
  'BR-A02': 'Slot có giới hạn xe tối đa',
  'BR-A03': 'Không booking khi slot đầy',
  'BR-A04': 'Booking phải có ít nhất 1 service package',
  'BR-A07': 'Một xe chỉ có 1 booking active',
  'BR-A08': 'Booking có start & end time',
  'BR-A45': 'Slot bị khóa không cho booking',
  'BR-A46': 'Kiểm tra conflict booking',
  'BR-A47': 'Phải nhập vehicle info khi booking',
  'BR-A48': 'Mỗi booking thuộc 1 customer',
  'BR-A53': 'Booking ID là duy nhất',
  'BR-A37': 'Vehicle plate unique trong cùng booking',
  
  // Check-in Rules
  'BR-A05': 'Xe phải check-in trước khi phục vụ',
  'BR-A13': 'Booking expired không check-in',
  'BR-A19': 'Ghi nhận check-in time thực tế',
  'BR-A35': 'QR check-in chỉ hợp lệ với booking active',
  'BR-A57': 'Check-in time không lớn hơn check-out time',
  
  // Booking Status Rules
  'BR-A12': 'Booking quá giờ tự động expired',
  'BR-A14': 'Booking canceled không phục vụ',
  
  // Loyalty Rules
  'BR-A29': 'Lưu lịch sử loyalty point',
  'BR-A30': 'Chỉ cộng điểm sau completion',
  'BR-A31': 'Không cộng điểm cho booking canceled',
  'BR-A32': 'Không cộng điểm cho booking expired',
  
  // Dashboard Rules
  'BR-A39': 'Completion cập nhật dashboard realtime',
  'BR-A40': 'Dashboard chỉ hiển thị dữ liệu hợp lệ',
  
  // Audit & Logging Rules
  'BR-A15': 'Lưu lịch sử trạng thái booking',
  'BR-A28': 'Lưu lịch sử booking',
  'BR-A52': 'Lưu audit log cho thao tác quan trọng',
  
  // Service Package Rules
  'BR-A21': 'Service package phải có estimated duration',
  'BR-A22': 'Mỗi package có mã định danh riêng',
  'BR-A23': 'Chỉ admin/manager tạo service package',
  'BR-A55': 'Service duration không được âm',
  'BR-A56': 'Slot duration phải lớn hơn 0 và >= service duration tối thiểu',
  
  // Walk-in Booking Rules
  'BR-A43': 'Walk-in phải tạo queue ticket',
  'BR-A44': 'Walk-in không vượt capacity',
} as const;

export type BusinessRuleCode = keyof typeof BUSINESS_RULES;

// ============================================
// LOYALTY TYPES
// ============================================

// BR-A29: Lưu lịch sử loyalty point
export interface LoyaltyTransaction {
  id: string;
  customerId: string; // BR-A54: Links to unique customer
  bookingId: string; // BR-A53: Links to unique booking
  points: number;
  type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUSTMENT';
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string; // BR-A30: Only add points after completion
}

// Customer loyalty summary
export interface CustomerLoyalty {
  customerId: string;
  totalPoints: number;
  lifetimePoints: number;
  tier: 'UNRANK' | 'BRONZE' | 'SILVER' | 'GOLD';
  transactionCount: number;
  birthday?: string; // YYYY-MM-DD format
  lastServiceDate?: string; // Track last service date for decay
  pointsDecayHistory?: PointsDecayRecord[];
}

// Points decay record for tracking monthly inactivity
export interface PointsDecayRecord {
  month: string; // YYYY-MM format
  pointsDeducted: number;
  reason: string;
}

// Voucher for birthday rewards
export interface BirthdayVoucher {
  id: string;
  customerId: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  isUsed: boolean;
  createdBy: string; // Admin ID who created
}

// Loyalty configuration - Updated with new tier system
// Unrank -> Đồng (Bronze): 100 điểm
// Đồng -> Bạc (Silver): Gấp đôi = 200 điểm (tổng 100 điểm để lên)
// Bạc -> Vàng (Gold): Gấp đôi = 400 điểm (tổng 200 điểm để lên)
export const LOYALTY_CONFIG = {
  pointsPerVND: 10000, // 1 point per 10,000 VND spent
  tierThresholds: {
    UNRANK: 0,
    BRONZE: 100,    // 100 điểm để lên Đồng
    SILVER: 300,    // 200 điểm thêm để lên Bạc (100 + 200 = 300)
    GOLD: 700,      // 400 điểm thêm để lên Vàng (300 + 400 = 700)
  },
  tierMultipliers: {
    UNRANK: 1.0,
    BRONZE: 1.0,
    SILVER: 1.2,
    GOLD: 1.5,
  },
  // Discount percentages by tier (from Bạc onwards)
  tierDiscounts: {
    UNRANK: 0,     // 0% discount
    BRONZE: 0,     // 0% discount  
    SILVER: 5,     // 5% discount from Bạc
    GOLD: 10,      // 10% discount
  },
  // Points decay for inactivity (không sử dụng dịch vụ)
  inactivityDecay: {
    firstMonth: 100,      // Tháng đầu không dùng: -100 điểm
    subsequentMultiplier: 2, // Tháng tiếp theo: gấp đôi lần trước
  },
} as const;

// ============================================
// AUDIT & LOGGING TYPES
// ============================================

// BR-A15: Lưu lịch sử trạng thái booking
export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  previousStatus: BookingStatus | null;
  newStatus: BookingStatus;
  changedBy: string; // User ID
  changedByRole: UserRole;
  reason?: string;
  timestamp: string;
}

// BR-A28: Lưu lịch sử booking (all changes)
export interface BookingHistory {
  id: string;
  bookingId: string;
  action: 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'CHECK_IN' | 'CHECK_OUT' | 'CANCEL' | 'EXPIRE';
  changes: Record<string, { old: unknown; new: unknown }>;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
}

// BR-A52: Lưu audit log cho thao tác quan trọng
export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: 'BOOKING' | 'SLOT' | 'SERVICE' | 'USER' | 'LOYALTY' | 'WALK_IN';
  entityId: string;
  performedBy: string;
  performedByRole: UserRole;
  details: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

export type AuditAction = 
  | 'BOOKING_CREATE'
  | 'BOOKING_UPDATE'
  | 'BOOKING_STATUS_CHANGE'
  | 'BOOKING_CHECK_IN'
  | 'BOOKING_CHECK_OUT'
  | 'BOOKING_CANCEL'
  | 'BOOKING_EXPIRE'
  | 'SLOT_LOCK'
  | 'SLOT_UNLOCK'
  | 'SLOT_UPDATE'
  | 'SERVICE_CREATE'
  | 'SERVICE_UPDATE'
  | 'SERVICE_DELETE'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_ROLE_CHANGE'
  | 'LOYALTY_EARN'
  | 'LOYALTY_REDEEM'
  | 'WALK_IN_CREATE';

// BR-A39, BR-A40: Dashboard statistics (realtime, valid data only)
export interface DashboardStats {
  totalBookings: number;
  validBookings: number; // BR-A40: Only valid (not cancelled/expired)
  completedBookings: number;
  cancelledBookings: number;
  expiredBookings: number;
  inProgressBookings: number;
  todayBookings: number;
  todayCompleted: number;
  revenue: number;
  todayRevenue: number;
  walkInCount: number;
  averageServiceTime: number;
  lastUpdated: string; // BR-A39: Track realtime updates
}

// ============================================
// EXTENDED RANK SYSTEM (5 tiers)
// ============================================

export type ExtendedLoyaltyTier = 'UNRANK' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface RankConfig {
  tier: ExtendedLoyaltyTier;
  name: string;
  minPoints: number;
  discountPercent: number;
  pointMultiplier: number;
  color: string;
  bgColor: string;
  icon: string;
  benefits: string[];
}

export const EXTENDED_LOYALTY_CONFIG = {
  pointsPerVND: 10000, // 1 point per 10,000 VND
  tierThresholds: {
    UNRANK: 0,
    BRONZE: 100,
    SILVER: 300,
    GOLD: 700,
    PLATINUM: 1500,
    DIAMOND: 3000,
  },
  tierDiscounts: {
    UNRANK: 0,
    BRONZE: 0,
    SILVER: 5,
    GOLD: 10,
    PLATINUM: 15,
    DIAMOND: 20,
  },
  tierMultipliers: {
    UNRANK: 1.0,
    BRONZE: 1.0,
    SILVER: 1.2,
    GOLD: 1.5,
    PLATINUM: 1.8,
    DIAMOND: 2.0,
  },
} as const;

// ============================================
// VOUCHER SYSTEM
// ============================================

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number; // % hoặc số tiền cố định
  maxDiscountAmount?: number; // Giá trị giảm tối đa (cho loại PERCENT)
  minOrderValue?: number; // Giá trị đơn tối thiểu
  usageLimit: number; // Số lần sử dụng tối đa (0 = unlimited)
  usedCount: number; // Số lần đã sử dụng
  perUserLimit: number; // Số lần mỗi user được dùng (0 = unlimited)
  validFrom: string;
  validUntil: string;
  applicableRanks: ExtendedLoyaltyTier[]; // Rank được áp dụng
  applicableServices?: string[]; // Service IDs được áp dụng (empty = all)
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherUsage {
  id: string;
  voucherId: string;
  voucherCode: string;
  customerId: string;
  bookingId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  voucher?: Voucher;
  discountAmount?: number;
  errors: string[];
}

// ============================================
// EVENTS & PROMOTIONS SYSTEM
// ============================================

export type EventType = 'PROMOTION' | 'FLASH_SALE' | 'HOLIDAY' | 'NEWS' | 'ANNOUNCEMENT';

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  bannerUrl?: string;
  thumbnailUrl?: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  linkedVoucherId?: string; // Voucher gắn với sự kiện
  linkedVoucherCode?: string;
  priority: number; // Độ ưu tiên hiển thị (cao hơn = hiển thị trước)
  isVisible: boolean;
  viewCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DISCOUNT CALCULATION
// ============================================

export interface DiscountBreakdown {
  originalPrice: number;
  rankTier: ExtendedLoyaltyTier;
  rankDiscountPercent: number;
  rankDiscountAmount: number;
  priceAfterRankDiscount: number;
  voucherCode?: string;
  voucherDiscountPercent?: number;
  voucherDiscountAmount: number;
  totalDiscountAmount: number;
  totalDiscountPercent: number;
  finalPrice: number;
}
