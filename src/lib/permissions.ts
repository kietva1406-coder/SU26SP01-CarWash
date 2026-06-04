import { UserRole, Permission } from './types';

/**
 * Business Rules Permission Matrix
 * 
 * BR-A24 — Chỉ admin/manager chỉnh sửa slot
 * BR-A25 — Staff chỉ cập nhật trạng thái service  
 * BR-A26 — Manager xem dashboard tổng hợp
 * BR-A27 — Customer chỉ xem booking của mình
 * BR-A54 — Customer ID là duy nhất
 */

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  customer: {
    canEditSlots: false,           // BR-A24: NO
    canUpdateServiceStatus: false, // BR-A25: NO
    canViewDashboard: false,       // BR-A26: NO
    canViewAllBookings: false,     // BR-A27: Can only view own bookings
    canManageServices: false,      // BR-A23: NO
    canManageUsers: false,
    canManageCustomers: false,
    canCreateWalkIn: false,        // BR-A43: NO
  },
  staff: {
    canEditSlots: false,           // BR-A24: NO
    canUpdateServiceStatus: true,  // BR-A25: YES - Staff can update service status
    canViewDashboard: false,       // BR-A26: NO
    canViewAllBookings: true,      // Can view queue for service
    canManageServices: false,      // BR-A23: NO
    canManageUsers: false,
    canManageCustomers: false,
    canCreateWalkIn: true,         // BR-A43: YES - Staff can create walk-ins
  },
  manager: {
    canEditSlots: true,            // BR-A24: YES - Manager can edit slots
    canUpdateServiceStatus: true,  // BR-A25: YES
    canViewDashboard: true,        // BR-A26: YES - Manager views dashboard
    canViewAllBookings: true,
    canManageServices: true,       // BR-A23: YES - Manager can create services
    canManageUsers: true,          // YES - Manager can manage staff
    canManageCustomers: false,     // NO - Only admin can manage customers
    canCreateWalkIn: true,         // BR-A43: YES
  },
  admin: {
    canEditSlots: true,            // BR-A24: YES - Admin can edit slots
    canUpdateServiceStatus: true,  // BR-A25: YES
    canViewDashboard: true,        // BR-A26: YES
    canViewAllBookings: true,
    canManageServices: true,       // BR-A23: YES - Admin can create services
    canManageUsers: true,          // YES - Admin can manage all users
    canManageCustomers: true,      // YES - Admin can manage customers
    canCreateWalkIn: true,         // BR-A43: YES
  },
};

export function getPermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role];
}

export function canEditSlots(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canEditSlots;
}

export function canUpdateServiceStatus(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canUpdateServiceStatus;
}

export function canViewDashboard(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canViewDashboard;
}

export function canViewBooking(role: UserRole, bookingCustomerId: string, currentUserId: string): boolean {
  // BR-A27: Customer can only view their own bookings
  if (role === 'customer') {
    return bookingCustomerId === currentUserId;
  }
  return ROLE_PERMISSIONS[role].canViewAllBookings;
}

export function canManageServices(role: UserRole): boolean {
  // BR-A23: Chỉ admin/manager tạo service package
  return ROLE_PERMISSIONS[role].canManageServices;
}

export function canCreateWalkIn(role: UserRole): boolean {
  // BR-A43: Staff, manager, admin can create walk-ins
  return ROLE_PERMISSIONS[role].canCreateWalkIn;
}

// Helper to check if user has elevated privileges
export function isElevatedRole(role: UserRole): boolean {
  return role === 'admin' || role === 'manager';
}

// Helper to get role display name in Vietnamese
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    customer: 'Khách Hàng',
    staff: 'Nhân Viên',
    manager: 'Quản Lý',
    admin: 'Admin',
  };
  return names[role];
}

// Get accessible tabs based on role
export function getAccessibleTabs(role: UserRole): string[] {
  switch (role) {
    case 'customer':
      return ['booking', 'my-bookings', 'loyalty', 'vehicles', 'events'];
    case 'staff':
      return ['queue'];
    case 'manager':
      return ['booking-history', 'customer-requests', 'dashboard', 'slots', 'services', 'combos', 'users'];
    case 'admin':
      return ['dashboard', 'slots', 'services', 'combos', 'users', 'vouchers', 'ranks', 'admin-events'];
    default:
      return [];
  }
}
