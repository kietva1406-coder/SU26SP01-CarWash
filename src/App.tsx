import { useState } from 'react';
import { Car, Shield, Lock, Unlock, AlertTriangle, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { BookingProvider } from '@/contexts/booking-context';
import { UserRole } from '@/lib/types';
import { getRoleDisplayName, getAccessibleTabs, canEditSlots, canViewDashboard } from '@/lib/permissions';
import RegistrationForm from '@/components/registration-form';
import CustomerBookingView from '@/components/customer-booking-view';
import CustomerMyBookingsView from '@/components/customer-my-bookings-view';
import CustomerLoyaltyView from '@/components/customer-loyalty-view';
import CustomerVehicleManagementView from '@/components/customer-vehicle-management-view';
import StaffQueueView from '@/components/staff-queue-view';
import ManagerDashboardView from '@/components/manager-dashboard-view';
import ManagerBookingHistoryView from '@/components/manager-booking-history-view';
import ManagerCustomerRequestsView from '@/components/manager-customer-requests-view';
import SlotManagementView from '@/components/slot-management-view';
import ServiceManagementView from '@/components/service-management-view';
import ComboManagementView from '@/components/combo-management-view';
import UserManagementView from '@/components/user-management-view';
import AdminVoucherManagement from '@/components/admin-voucher-management';
import AdminRankManagement from '@/components/admin-rank-management';
import AdminEventsManagement from '@/components/admin-events-management';
import EventsListView from '@/components/events-list-view';

function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const roles: UserRole[] = ['customer', 'staff', 'manager', 'admin'];

  return (
    <div className="flex items-center gap-2">
      <Shield className="w-4 h-4 text-slate-500" />
      <span className="text-sm text-slate-600 mr-2">Demo:</span>
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => switchRole(role)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            user?.role === role
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {getRoleDisplayName(role)}
        </button>
      ))}
    </div>
  );
}

function BusinessRulesIndicator() {
  const { user, permissions } = useAuth();
  const [showRules, setShowRules] = useState(false);

  if (!user || !permissions) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowRules(!showRules)}
        className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
      >
        <AlertTriangle className="w-4 h-4" />
        Business Rules
      </button>

      {showRules && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50">
          <h4 className="font-semibold text-slate-900 mb-3">Quyền của {getRoleDisplayName(user.role)}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {permissions.canEditSlots ? (
                <Unlock className="w-4 h-4 text-green-600" />
              ) : (
                <Lock className="w-4 h-4 text-red-500" />
              )}
              <span className={permissions.canEditSlots ? 'text-green-700' : 'text-slate-500'}>
                BR-A24: Chỉnh sửa slot
              </span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canUpdateServiceStatus ? (
                <Unlock className="w-4 h-4 text-green-600" />
              ) : (
                <Lock className="w-4 h-4 text-red-500" />
              )}
              <span className={permissions.canUpdateServiceStatus ? 'text-green-700' : 'text-slate-500'}>
                BR-A25: Cập nhật trạng thái
              </span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canViewDashboard ? (
                <Unlock className="w-4 h-4 text-green-600" />
              ) : (
                <Lock className="w-4 h-4 text-red-500" />
              )}
              <span className={permissions.canViewDashboard ? 'text-green-700' : 'text-slate-500'}>
                BR-A26: Xem dashboard
              </span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canViewAllBookings ? (
                <Unlock className="w-4 h-4 text-green-600" />
              ) : (
                <Lock className="w-4 h-4 text-red-500" />
              )}
              <span className={permissions.canViewAllBookings ? 'text-green-700' : 'text-slate-500'}>
                BR-A27: Xem tất cả booking
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
            BR-A54: Customer ID duy nhất: {user.id}
          </div>
        </div>
      )}
    </div>
  );
}

function LoginScreen() {
  const { login, loginWithCredentials } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const roles: UserRole[] = ['customer', 'staff', 'manager', 'admin'];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      const result = loginWithCredentials(email, password);
      if (!result.success) {
        setError(result.error || 'Đăng nhập thất bại');
      }
      setIsLoading(false);
    }, 500);
  };

  const demoAccounts = [
    { email: 'customer@example.com', role: 'Khách Hàng', description: 'Đặt lịch và xem booking' },
    { email: 'staff@example.com', role: 'Nhân Viên', description: 'Cập nhật trạng thái dịch vụ' },
    { email: 'manager@example.com', role: 'Quản Lý', description: 'Xem dashboard và quản lý slot' },
    { email: 'admin@example.com', role: 'Admin', description: 'Toàn quyền quản trị hệ thống' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Rửa Xe Thông Minh</h1>
          <p className="text-slate-500 mt-2">{isRegistering ? 'Đăng ký tài khoản' : 'Đăng nhập để tiếp tục'}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-6 border-b border-slate-200">
          <button
            onClick={() => setIsRegistering(false)}
            className={`py-3 px-4 font-medium transition-colors border-b-2 -mb-0.5 ${
              !isRegistering
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => setIsRegistering(true)}
            className={`py-3 px-4 font-medium transition-colors border-b-2 -mb-0.5 ${
              isRegistering
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Login/Registration Form */}
        {!isRegistering ? (
          <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Đăng Nhập
              </>
            )}
          </button>
        </form>
        ) : (
          <RegistrationForm 
            onRegistrationSuccess={() => setIsRegistering(false)}
            onSwitchToLogin={() => setIsRegistering(false)}
          />
        )}

        {/* Demo Accounts Toggle - Only for Login */}
        {!isRegistering && (
        <div className="mt-6">
          <button
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showDemoAccounts ? 'Ẩn tài khoản demo' : 'Xem tài khoản demo'}
          </button>
        </div>
        )}

        {/* Demo Accounts - Only for Login */}
        {!isRegistering && showDemoAccounts && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 text-center mb-3">
              Mật khẩu cho tất cả tài khoản: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">123456</span>
            </p>
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword('123456');
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-900 text-sm">{account.role}</div>
                  <div className="text-xs font-mono text-slate-500">{account.email}</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">{account.description}</div>
              </button>
            ))}
          </div>
        )}


      </div>
    </div>
  );
}

function MainApp() {
  const { user, permissions, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('');

  if (!user || !permissions) return <LoginScreen />;

  const accessibleTabs = getAccessibleTabs(user.role);
  
  // Set default tab based on role
  if (!activeTab || !accessibleTabs.includes(activeTab)) {
    if (accessibleTabs.length > 0 && activeTab !== accessibleTabs[0]) {
      setActiveTab(accessibleTabs[0]);
    }
  }

  const tabLabels: Record<string, string> = {
    'booking': 'Đặt Lịch',
    'my-bookings': 'Lịch Của Tôi',
    'loyalty': 'Điểm Thưởng',
    'vehicles': 'Quản Lý Xe',
    'events': 'Khuyến Mãi',
    'queue': 'Hàng Đợi',
    'booking-history': 'Lịch Sử Booking',
    'customer-requests': 'Danh Sách Yêu Cầu',
    'dashboard': 'Dashboard',
    'slots': 'Quản Lý Slot',
    'services': 'Quản Lý Dịch Vụ',
    'combos': 'Quản Lý Combo',
    'users': 'Quản Lý User',
    'vouchers': 'Quản Lý Voucher',
    'ranks': 'Quản Lý Rank',
    'admin-events': 'Quản Lý Sự Kiện',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Rửa Xe Thông Minh</span>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              <BusinessRulesIndicator />
              <div className="text-sm text-slate-600">
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Role Switcher (Demo Only) */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <RoleSwitcher />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-none">
            {accessibleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'booking' && <CustomerBookingView />}
        {activeTab === 'my-bookings' && <CustomerMyBookingsView />}
        {activeTab === 'loyalty' && <CustomerLoyaltyView />}
        {activeTab === 'vehicles' && <CustomerVehicleManagementView />}
        {activeTab === 'events' && <EventsListView />}
        {activeTab === 'queue' && user.role === 'staff' && <StaffQueueView />}
        {activeTab === 'booking-history' && <ManagerBookingHistoryView />}
        {activeTab === 'customer-requests' && <ManagerCustomerRequestsView />}
        {activeTab === 'dashboard' && canViewDashboard(user.role) && <ManagerDashboardView />}
        {activeTab === 'slots' && canEditSlots(user.role) && <SlotManagementView />}
        {activeTab === 'services' && permissions.canManageServices && <ServiceManagementView />}
        {activeTab === 'combos' && permissions.canManageServices && <ComboManagementView />}
        {activeTab === 'users' && permissions.canManageUsers && <UserManagementView />}
        {activeTab === 'vouchers' && user.role === 'admin' && <AdminVoucherManagement />}
        {activeTab === 'ranks' && user.role === 'admin' && <AdminRankManagement />}
        {activeTab === 'admin-events' && user.role === 'admin' && <AdminEventsManagement />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MainApp />
      </BookingProvider>
    </AuthProvider>
  );
}
