import { 
  Booking, 
  Service, 
  TimeSlot, 
  ValidationResult, 
  ValidationError,
  BusinessRuleCode,
  BUSINESS_RULES,
  BookingStatus
} from './types';

// Generate unique booking ID (BR-A53)
export function generateBookingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
}

// Generate queue ticket for walk-ins (BR-A43)
export function generateQueueTicket(): string {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `WI${today}-${random}`;
}

// Calculate end time from start time and service durations (BR-A08)
export function calculateEndTime(startTime: string, services: Service[]): string {
  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + totalDuration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

// Check if vehicle has active booking (BR-A07)
export function hasActiveBooking(plateNumber: string, bookings: Booking[]): boolean {
  const activeStatuses = ['PENDING_CHECKIN', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'];
  return bookings.some(
    b => b.plateNumber === plateNumber && activeStatuses.includes(b.status)
  );
}

// Check for booking conflicts (BR-A46)
export function hasBookingConflict(
  slotId: string,
  date: string,
  startTime: string,
  endTime: string,
  bookings: Booking[],
  excludeBookingId?: string
): boolean {
  const slotBookings = bookings.filter(
    b => b.slotId === slotId && 
         b.date === date && 
         b.status !== 'CANCELLED' &&
         b.id !== excludeBookingId
  );
  
  for (const booking of slotBookings) {
    // Check time overlap
    if (
      (startTime >= booking.startTime && startTime < booking.endTime) ||
      (endTime > booking.startTime && endTime <= booking.endTime) ||
      (startTime <= booking.startTime && endTime >= booking.endTime)
    ) {
      return true;
    }
  }
  return false;
}

// Check if slot is available for booking
export function isSlotAvailable(slot: TimeSlot): { available: boolean; reason?: string; rule?: BusinessRuleCode } {
  // BR-A45: Slot bị khóa không cho booking
  if (slot.locked) {
    return { available: false, reason: 'Slot đã bị khóa', rule: 'BR-A45' };
  }
  
  // BR-A03: Không booking khi slot đầy
  if (slot.currentBookings >= slot.maxCapacity) {
    return { available: false, reason: 'Slot đã đầy', rule: 'BR-A03' };
  }
  
  // BR-A56: Slot duration phải lớn hơn 0
  if (slot.duration <= 0) {
    return { available: false, reason: 'Slot duration không hợp lệ', rule: 'BR-A56' };
  }
  
  return { available: true };
}

// Validate booking creation
export function validateBooking(
  booking: Partial<Booking>,
  slots: TimeSlot[],
  services: Service[],
  existingBookings: Booking[],
  customerId: string
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // BR-A47: Phải nhập vehicle info khi booking
  if (!booking.plateNumber || booking.plateNumber.trim() === '') {
    errors.push({
      rule: 'BR-A47',
      message: BUSINESS_RULES['BR-A47'],
      field: 'plateNumber'
    });
  }
  
  // BR-A04: Booking phải có ít nhất 1 service package
  if (!booking.serviceIds || booking.serviceIds.length === 0) {
    errors.push({
      rule: 'BR-A04',
      message: BUSINESS_RULES['BR-A04'],
      field: 'serviceIds'
    });
  }
  
  // BR-A01: Booking phải thuộc slot hợp lệ
  if (!booking.slotId) {
    errors.push({
      rule: 'BR-A01',
      message: BUSINESS_RULES['BR-A01'],
      field: 'slotId'
    });
  } else {
    const slot = slots.find(s => s.id === booking.slotId);
    if (!slot) {
      errors.push({
        rule: 'BR-A01',
        message: 'Slot không tồn tại',
        field: 'slotId'
      });
    } else {
      // Check slot availability
      const slotCheck = isSlotAvailable(slot);
      if (!slotCheck.available) {
        errors.push({
          rule: slotCheck.rule!,
          message: slotCheck.reason!,
          field: 'slotId'
        });
      }
      
      // BR-A56: Validate slot duration against service duration
      if (booking.serviceIds && booking.serviceIds.length > 0) {
        const selectedServices = services.filter(s => booking.serviceIds!.includes(s.id));
        const totalServiceDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
        
        if (slot.duration < totalServiceDuration) {
          errors.push({
            rule: 'BR-A56',
            message: `Slot duration (${slot.duration} phút) < tổng service duration (${totalServiceDuration} phút)`,
            field: 'slotId'
          });
        }
      }
    }
  }
  
  // BR-A07: Một xe chỉ có 1 booking active
  if (booking.plateNumber && hasActiveBooking(booking.plateNumber, existingBookings)) {
    errors.push({
      rule: 'BR-A07',
      message: BUSINESS_RULES['BR-A07'],
      field: 'plateNumber'
    });
  }
  
  // BR-A46: Kiểm tra conflict booking
  if (booking.slotId && booking.date && booking.startTime && booking.endTime) {
    if (hasBookingConflict(
      booking.slotId, 
      booking.date, 
      booking.startTime, 
      booking.endTime, 
      existingBookings
    )) {
      errors.push({
        rule: 'BR-A46',
        message: BUSINESS_RULES['BR-A46'],
        field: 'startTime'
      });
    }
  }
  
  // BR-A48: Mỗi booking thuộc 1 customer
  if (!customerId) {
    errors.push({
      rule: 'BR-A48',
      message: BUSINESS_RULES['BR-A48'],
      field: 'customerId'
    });
  }
  
  // Validate selected services
  if (booking.serviceIds) {
    for (const serviceId of booking.serviceIds) {
      const service = services.find(s => s.id === serviceId);
      
      // BR-A21: Service package phải có estimated duration
      if (service && (!service.duration || service.duration <= 0)) {
        errors.push({
          rule: 'BR-A21',
          message: `${service.name}: ${BUSINESS_RULES['BR-A21']}`,
          field: 'serviceIds'
        });
      }
      
      // BR-A55: Service duration không được âm
      if (service && service.duration < 0) {
        errors.push({
          rule: 'BR-A55',
          message: `${service.name}: ${BUSINESS_RULES['BR-A55']}`,
          field: 'serviceIds'
        });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate walk-in booking (BR-A43, BR-A44)
export function validateWalkIn(
  slot: TimeSlot,
  currentWalkIns: number,
  maxWalkInCapacity: number
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // BR-A44: Walk-in không vượt capacity
  if (currentWalkIns >= maxWalkInCapacity) {
    errors.push({
      rule: 'BR-A44',
      message: BUSINESS_RULES['BR-A44']
    });
  }
  
  // Also check slot availability
  const slotCheck = isSlotAvailable(slot);
  if (!slotCheck.available) {
    errors.push({
      rule: slotCheck.rule!,
      message: slotCheck.reason!
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate service package creation/update (BR-A23, BR-A21, BR-A55)
export function validateService(
  service: Partial<Service>,
  existingServices: Service[]
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // BR-A21: Service package phải có estimated duration
  if (service.duration === undefined || service.duration === null) {
    errors.push({
      rule: 'BR-A21',
      message: BUSINESS_RULES['BR-A21'],
      field: 'duration'
    });
  }
  
  // BR-A55: Service duration không được âm
  if (service.duration !== undefined && service.duration < 0) {
    errors.push({
      rule: 'BR-A55',
      message: BUSINESS_RULES['BR-A55'],
      field: 'duration'
    });
  }
  
  // BR-A22: Mỗi package có mã định danh riêng
  if (service.id && existingServices.some(s => s.id === service.id)) {
    errors.push({
      rule: 'BR-A22',
      message: BUSINESS_RULES['BR-A22'],
      field: 'id'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate slot creation/update (BR-A56)
export function validateSlot(
  slot: Partial<TimeSlot>,
  minServiceDuration: number = 15
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // BR-A56: Slot duration phải lớn hơn 0
  if (slot.duration !== undefined && slot.duration <= 0) {
    errors.push({
      rule: 'BR-A56',
      message: 'Slot duration phải lớn hơn 0',
      field: 'duration'
    });
  }
  
  // BR-A56: Slot duration >= service duration tối thiểu
  if (slot.duration !== undefined && slot.duration < minServiceDuration) {
    errors.push({
      rule: 'BR-A56',
      message: `Slot duration phải >= ${minServiceDuration} phút (service duration tối thiểu)`,
      field: 'duration'
    });
  }
  
  // BR-A02: Slot có giới hạn xe tối đa
  if (slot.maxCapacity !== undefined && slot.maxCapacity <= 0) {
    errors.push({
      rule: 'BR-A02',
      message: 'Slot capacity phải lớn hơn 0',
      field: 'maxCapacity'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// CHECK-IN VALIDATION RULES
// ============================================

// Parse time string to minutes since midnight
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get current time as HH:mm string
export function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Get current date as YYYY-MM-DD string
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Check if booking is expired (BR-A12)
export function isBookingExpired(booking: Booking, gracePeriodMinutes: number = 15): boolean {
  const now = new Date();
  const bookingDate = new Date(booking.date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
  
  // If booking date is in the past, it's expired
  if (bookingDay < today) {
    return true;
  }
  
  // If booking date is today, check time with grace period
  if (bookingDay.getTime() === today.getTime()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const bookingEndMinutes = parseTimeToMinutes(booking.endTime);
    
    // Expired if current time is past end time + grace period
    if (currentMinutes > bookingEndMinutes + gracePeriodMinutes) {
      return true;
    }
  }
  
  return false;
}

// Auto-expire bookings (BR-A12)
export function processExpiredBookings(bookings: Booking[]): Booking[] {
  return bookings.map(booking => {
    if (booking.status === 'PENDING_CHECKIN' && isBookingExpired(booking)) {
      return {
        ...booking,
        status: 'EXPIRED' as BookingStatus,
        updatedAt: new Date().toISOString()
      };
    }
    return booking;
  });
}

// Validate check-in (BR-A05, BR-A13, BR-A19, BR-A35, BR-A57)
// Check-in chuyển từ PENDING_CHECKIN -> CONFIRMED
export function validateCheckIn(booking: Booking): ValidationResult {
  const errors: ValidationError[] = [];
  
  // BR-A35: QR check-in chỉ hợp lệ với booking PENDING_CHECKIN status
  if (booking.status !== 'PENDING_CHECKIN') {
    if (booking.status === 'CANCELLED') {
      // BR-A14: Booking canceled không phục vụ
      errors.push({
        rule: 'BR-A14',
        message: BUSINESS_RULES['BR-A14']
      });
    } else if (booking.status === 'EXPIRED') {
      // BR-A13: Booking expired không check-in
      errors.push({
        rule: 'BR-A13',
        message: BUSINESS_RULES['BR-A13']
      });
    } else if (booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'IN_PROGRESS') {
      errors.push({
        rule: 'BR-A35',
        message: 'Booking đã được xác nhận/check-in'
      });
    } else if (booking.status === 'COMPLETED') {
      errors.push({
        rule: 'BR-A35',
        message: 'Booking đã hoàn thành'
      });
    } else {
      errors.push({
        rule: 'BR-A35',
        message: BUSINESS_RULES['BR-A35']
      });
    }
  }
  
  // Check if booking is expired (BR-A12, BR-A13)
  if (booking.status === 'PENDING_CHECKIN' && isBookingExpired(booking)) {
    errors.push({
      rule: 'BR-A13',
      message: BUSINESS_RULES['BR-A13']
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Perform check-in and record time (BR-A19)
// Chuyển từ PENDING_CHECKIN -> CONFIRMED (xác nhận khi nhân viên check-in)
export function performCheckIn(booking: Booking): Booking {
  const now = new Date().toISOString();
  return {
    ...booking,
    status: 'CONFIRMED' as BookingStatus, // Chuyển sang CONFIRMED khi nhân viên check-in
    checkInTime: now, // BR-A19: Ghi nhận check-in time thực tế
    updatedAt: now
  };
}

// Validate status transition (BR-A05, BR-A14)
// Flow: PENDING_CHECKIN -> CONFIRMED (check-in) -> CHECKED_IN (bắt đầu) -> IN_PROGRESS -> COMPLETED
export function validateStatusTransition(
  booking: Booking, 
  newStatus: BookingStatus
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // BR-A14: Booking canceled không phục vụ
  if (booking.status === 'CANCELLED') {
    errors.push({
      rule: 'BR-A14',
      message: BUSINESS_RULES['BR-A14']
    });
    return { valid: false, errors };
  }
  
  // BR-A14: Cannot change status of expired booking
  if (booking.status === 'EXPIRED' && newStatus !== 'CANCELLED') {
    errors.push({
      rule: 'BR-A13',
      message: 'Không thể thay đổi trạng thái booking đã hết hạn'
    });
    return { valid: false, errors };
  }
  
  // BR-A05: Xe phải check-in (CONFIRMED) trước khi bắt đầu dịch vụ
  if (newStatus === 'CHECKED_IN' && booking.status !== 'CONFIRMED') {
    errors.push({
      rule: 'BR-A05',
      message: 'Booking phải được xác nhận (check-in) trước khi bắt đầu dịch vụ'
    });
  }
  
  // BR-A05: Xe phải ở trạng thái CHECKED_IN trước khi IN_PROGRESS
  if (newStatus === 'IN_PROGRESS' && booking.status !== 'CHECKED_IN') {
    errors.push({
      rule: 'BR-A05',
      message: BUSINESS_RULES['BR-A05']
    });
  }
  
  // Cannot go backwards in status (except cancellation)
  const statusOrder: BookingStatus[] = ['PENDING_CHECKIN', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(booking.status);
  const newIndex = statusOrder.indexOf(newStatus);
  
  if (newStatus !== 'CANCELLED' && newStatus !== 'EXPIRED' && 
      currentIndex !== -1 && newIndex !== -1 && newIndex < currentIndex) {
    errors.push({
      rule: 'BR-A05',
      message: 'Không thể quay lại trạng thái trước đó'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Perform check-out and validate time (BR-A57)
export function performCheckOut(booking: Booking): { booking: Booking; validation: ValidationResult } {
  const errors: ValidationError[] = [];
  const now = new Date().toISOString();
  
  // BR-A57: Check-in time không lớn hơn check-out time
  if (booking.checkInTime && new Date(booking.checkInTime) > new Date(now)) {
    errors.push({
      rule: 'BR-A57',
      message: BUSINESS_RULES['BR-A57']
    });
  }
  
  if (errors.length > 0) {
    return {
      booking,
      validation: { valid: false, errors }
    };
  }
  
  return {
    booking: {
      ...booking,
      status: 'COMPLETED' as BookingStatus,
      checkOutTime: now,
      updatedAt: now
    },
    validation: { valid: true, errors: [] }
  };
}

// Check if QR code is valid for check-in (BR-A35)
export function validateQRCheckIn(bookingId: string, bookings: Booking[]): ValidationResult {
  const errors: ValidationError[] = [];
  
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) {
    errors.push({
      rule: 'BR-A35',
      message: 'Booking không tồn tại'
    });
    return { valid: false, errors };
  }
  
  return validateCheckIn(booking);
}

// Get list of bookings that can be checked in
// Chỉ PENDING_CHECKIN mới có thể check-in
export function getCheckInEligibleBookings(bookings: Booking[]): Booking[] {
  return bookings.filter(b => {
    const validation = validateCheckIn(b);
    return validation.valid;
  });
}

// Get list of bookings that can start service (BR-A05)
// Chỉ CONFIRMED (đã check-in) mới có thể bắt đầu dịch vụ
export function getServiceEligibleBookings(bookings: Booking[]): Booking[] {
  // BR-A05: Only confirmed bookings (after check-in) can start service
  return bookings.filter(b => b.status === 'CONFIRMED');
}
