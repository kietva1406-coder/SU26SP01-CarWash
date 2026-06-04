import {
  AuditLog,
  AuditAction,
  BookingStatusHistory,
  BookingHistory,
  Booking,
  BookingStatus,
  UserRole,
  DashboardStats,
  Service,
} from './types';

// ============================================
// AUDIT LOG FUNCTIONS (BR-A52)
// ============================================

let auditLogIdCounter = 1;

// BR-A52: Create audit log for important actions
export function createAuditLog(
  action: AuditAction,
  entityType: AuditLog['entityType'],
  entityId: string,
  performedBy: string,
  performedByRole: UserRole,
  details: string,
  metadata?: Record<string, unknown>
): AuditLog {
  return {
    id: `AL${String(auditLogIdCounter++).padStart(5, '0')}`,
    action,
    entityType,
    entityId,
    performedBy,
    performedByRole,
    details,
    metadata,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// BOOKING STATUS HISTORY FUNCTIONS (BR-A15)
// ============================================

let statusHistoryIdCounter = 1;

// BR-A15: Record booking status change
export function createStatusHistoryEntry(
  bookingId: string,
  previousStatus: BookingStatus | null,
  newStatus: BookingStatus,
  changedBy: string,
  changedByRole: UserRole,
  reason?: string
): BookingStatusHistory {
  return {
    id: `BSH${String(statusHistoryIdCounter++).padStart(5, '0')}`,
    bookingId,
    previousStatus,
    newStatus,
    changedBy,
    changedByRole,
    reason,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// BOOKING HISTORY FUNCTIONS (BR-A28)
// ============================================

let bookingHistoryIdCounter = 1;

// BR-A28: Record booking changes
export function createBookingHistoryEntry(
  bookingId: string,
  action: BookingHistory['action'],
  changes: Record<string, { old: unknown; new: unknown }>,
  performedBy: string,
  performedByRole: UserRole
): BookingHistory {
  return {
    id: `BH${String(bookingHistoryIdCounter++).padStart(5, '0')}`,
    bookingId,
    action,
    changes,
    performedBy,
    performedByRole,
    timestamp: new Date().toISOString(),
  };
}

// Helper to detect changes between two booking objects
export function detectBookingChanges(
  oldBooking: Partial<Booking>,
  newBooking: Partial<Booking>
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const keys = new Set([...Object.keys(oldBooking), ...Object.keys(newBooking)]);

  keys.forEach((key) => {
    const oldValue = oldBooking[key as keyof Booking];
    const newValue = newBooking[key as keyof Booking];
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { old: oldValue, new: newValue };
    }
  });

  return changes;
}

// ============================================
// DASHBOARD STATISTICS FUNCTIONS (BR-A39, BR-A40)
// ============================================

// BR-A40: Calculate dashboard stats from valid data only
export function calculateDashboardStats(
  bookings: Booking[],
  services: Service[]
): DashboardStats {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // BR-A40: Filter for valid bookings (exclude cancelled and expired for certain metrics)
  const allBookings = bookings;
  const validBookings = bookings.filter(
    (b) => b.status !== 'CANCELLED' && b.status !== 'EXPIRED'
  );
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
  const expiredBookings = bookings.filter((b) => b.status === 'EXPIRED');
  const inProgressBookings = bookings.filter(
    (b) => b.status === 'IN_PROGRESS' || b.status === 'CHECKED_IN'
  );

  // Today's bookings
  const todayBookings = bookings.filter((b) => b.date === today);
  const todayCompleted = todayBookings.filter((b) => b.status === 'COMPLETED');

  // Calculate revenue from completed bookings only (BR-A40: valid data)
  const revenue = completedBookings.reduce((sum, booking) => {
    const bookingTotal = booking.serviceIds.reduce((serviceSum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return serviceSum + (service?.price || 0);
    }, 0);
    return sum + bookingTotal;
  }, 0);

  const todayRevenue = todayCompleted.reduce((sum, booking) => {
    const bookingTotal = booking.serviceIds.reduce((serviceSum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return serviceSum + (service?.price || 0);
    }, 0);
    return sum + bookingTotal;
  }, 0);

  // Calculate average service time from completed bookings with check-in/out times
  const completedWithTimes = completedBookings.filter(
    (b) => b.checkInTime && b.checkOutTime
  );
  const averageServiceTime =
    completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, b) => {
          const checkIn = new Date(b.checkInTime!).getTime();
          const checkOut = new Date(b.checkOutTime!).getTime();
          return sum + (checkOut - checkIn) / (1000 * 60); // minutes
        }, 0) / completedWithTimes.length
      : 0;

  // Walk-in count
  const walkInCount = validBookings.filter((b) => b.isWalkIn).length;

  return {
    totalBookings: allBookings.length,
    validBookings: validBookings.length,
    completedBookings: completedBookings.length,
    cancelledBookings: cancelledBookings.length,
    expiredBookings: expiredBookings.length,
    inProgressBookings: inProgressBookings.length,
    todayBookings: todayBookings.length,
    todayCompleted: todayCompleted.length,
    revenue,
    todayRevenue,
    walkInCount,
    averageServiceTime: Math.round(averageServiceTime),
    lastUpdated: now.toISOString(), // BR-A39: Track realtime updates
  };
}

// Format currency for display
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
}

// Format time ago for realtime display
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return then.toLocaleDateString('vi-VN');
}

// Get audit action description in Vietnamese
export function getAuditActionDescription(action: AuditAction): string {
  const descriptions: Record<AuditAction, string> = {
    BOOKING_CREATE: 'Tạo booking mới',
    BOOKING_UPDATE: 'Cập nhật booking',
    BOOKING_STATUS_CHANGE: 'Thay đổi trạng thái booking',
    BOOKING_CHECK_IN: 'Check-in booking',
    BOOKING_CHECK_OUT: 'Check-out booking',
    BOOKING_CANCEL: 'Hủy booking',
    BOOKING_EXPIRE: 'Booking hết hạn',
    SLOT_LOCK: 'Khóa slot',
    SLOT_UNLOCK: 'Mở khóa slot',
    SLOT_UPDATE: 'Cập nhật slot',
    SERVICE_CREATE: 'Tạo dịch vụ mới',
    SERVICE_UPDATE: 'Cập nhật dịch vụ',
    SERVICE_DELETE: 'Xóa dịch vụ',
    USER_LOGIN: 'Đăng nhập',
    USER_LOGOUT: 'Đăng xuất',
    USER_ROLE_CHANGE: 'Thay đổi vai trò',
    LOYALTY_EARN: 'Tích điểm thưởng',
    LOYALTY_REDEEM: 'Đổi điểm thưởng',
    WALK_IN_CREATE: 'Tạo walk-in',
  };
  return descriptions[action] || action;
}

// Get status change reason based on transition
export function getStatusChangeReason(
  oldStatus: BookingStatus | null,
  newStatus: BookingStatus
): string {
  if (oldStatus === null) return 'Booking mới được tạo';
  if (newStatus === 'CHECKED_IN') return 'Khách hàng đã check-in';
  if (newStatus === 'IN_PROGRESS') return 'Bắt đầu thực hiện dịch vụ';
  if (newStatus === 'COMPLETED') return 'Hoàn thành dịch vụ';
  if (newStatus === 'CANCELLED') return 'Booking bị hủy';
  if (newStatus === 'EXPIRED') return 'Booking quá hạn tự động hết hạn (BR-A12)';
  return `Chuyển từ ${oldStatus} sang ${newStatus}`;
}
