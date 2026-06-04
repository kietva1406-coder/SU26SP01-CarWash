'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/contexts/booking-context';
import { MOCK_SERVICES, MOCK_AUDIT_LOGS, MOCK_STATUS_HISTORY } from '@/lib/mock-data';
import { canViewDashboard } from '@/lib/permissions';
import { Booking, AuditLog, BookingStatusHistory, BookingStatus } from '@/lib/types';
import { 
  calculateDashboardStats, 
  formatCurrency, 
  formatTimeAgo,
  getAuditActionDescription 
} from '@/lib/audit';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Lock, 
  RefreshCw,
  Clock,
  AlertCircle,
  FileText,
  History,
  Activity,
  Users,
  Car
} from 'lucide-react';

const STATUS_COLORS: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-gray-100 text-gray-700',
  CHECKED_IN: 'bg-orange-100 text-orange-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-100 text-slate-500',
};

export default function ManagerDashboardView() {
  const { user, permissions } = useAuth();
  const { bookings } = useBookings();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [statusHistory, setStatusHistory] = useState<BookingStatusHistory[]>(MOCK_STATUS_HISTORY);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'history'>('overview');

  // BR-A39: Calculate stats with realtime updates
  const stats = calculateDashboardStats(bookings, MOCK_SERVICES);

  // BR-A39: Simulate realtime updates
  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    // Simulate API call delay
    setTimeout(() => {
      // In real app, this would fetch from API
      // Bookings now come from context, so they're already up-to-date
      setAuditLogs([...MOCK_AUDIT_LOGS]);
      setStatusHistory([...MOCK_STATUS_HISTORY]);
      setIsRefreshing(false);
    }, 500);
  }, []);

  // BR-A39: Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  if (!user || !permissions) return null;

  // BR-A26: Manager xem dashboard tổng hợp
  const canView = canViewDashboard(user.role);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Lock className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Khong co quyen truy cap</h2>
        <p className="text-slate-500 mt-2">
          BR-A26: Chi Manager va Admin moi duoc xem dashboard tong hop
        </p>
      </div>
    );
  }

  // BR-A40: Get only valid bookings for display
  const validBookings = bookings.filter(
    (b) => b.status !== 'CANCELLED' && b.status !== 'EXPIRED'
  );
  const recentBookings = bookings.slice(0, 5);
  const recentAuditLogs = auditLogs.slice(-10).reverse();
  const recentStatusHistory = statusHistory.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Permission & Rules Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-700 text-sm">
              <strong>BR-A26:</strong> Ban co quyen xem dashboard tong hop vi ban la {user.role === 'admin' ? 'Admin' : 'Manager'}
            </p>
            <p className="text-green-600 text-xs mt-1">
              BR-A39: Dashboard cap nhat realtime | BR-A40: Chi hien thi du lieu hop le
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Dang cap nhat...' : 'Cap nhat'}
          </button>
        </div>
      </div>

      {/* Last Updated Indicator (BR-A39) */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Activity className="w-4 h-4" />
        <span>Cap nhat luc: {formatTimeAgo(stats.lastUpdated)}</span>
        <span className="text-slate-300">|</span>
        <span>Booking hop le: {stats.validBookings}/{stats.totalBookings} (BR-A40)</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Tong quan
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Log (BR-A52)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Lich su Trang thai (BR-A15)
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-600 text-sm font-medium mb-2">Booking Hop Le</div>
                  <div className="text-3xl font-bold text-indigo-600">{stats.validBookings}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    BR-A40: Khong tinh cancelled/expired
                  </div>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-600 text-sm font-medium mb-2">Doanh Thu</div>
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.revenue)}d</div>
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                    <TrendingUp className="w-3 h-3" />
                    Hom nay: {formatCurrency(stats.todayRevenue)}d
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-600 text-sm font-medium mb-2">Hoan Thanh</div>
                  <div className="text-3xl font-bold text-blue-600">{stats.completedBookings}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    {stats.totalBookings > 0 
                      ? Math.round((stats.completedBookings / stats.totalBookings) * 100) 
                      : 0}% ti le hoan thanh
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-600 text-sm font-medium mb-2">Huy/Het han</div>
                  <div className="text-3xl font-bold text-red-600">
                    {stats.cancelledBookings + stats.expiredBookings}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <span>Huy: {stats.cancelledBookings}</span>
                    <span>|</span>
                    <span>Het han: {stats.expiredBookings}</span>
                  </div>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Dang xu ly</div>
                  <div className="text-xl font-bold text-amber-600">{stats.inProgressBookings}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Walk-in</div>
                  <div className="text-xl font-bold text-purple-600">{stats.walkInCount}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg">
                  <Car className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Hom nay</div>
                  <div className="text-xl font-bold text-cyan-600">{stats.todayBookings}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">TB thoi gian</div>
                  <div className="text-xl font-bold text-teal-600">{stats.averageServiceTime} phut</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Doanh Thu Theo Tuan</h3>
              <div className="h-48 bg-gradient-to-t from-indigo-100 to-transparent rounded-lg flex items-end justify-around p-4">
                {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                  <div
                    key={i}
                    className="bg-indigo-500 rounded-t w-8 transition-all hover:bg-indigo-600"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-around mt-2 text-xs text-slate-500">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>
            </div>

            {/* Service Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Phan Bo Dich Vu</h3>
              <div className="space-y-4">
                {MOCK_SERVICES.map((service, index) => {
                  const colors = ['bg-indigo-500', 'bg-green-500', 'bg-blue-500', 'bg-orange-500'];
                  const percentages = [45, 30, 15, 10];
                  return (
                    <div key={service.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{service.name}</span>
                        <span className="text-slate-900 font-medium">{percentages[index]}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div
                          className={`h-2 ${colors[index]} rounded-full transition-all`}
                          style={{ width: `${percentages[index]}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Bookings (BR-A40: Only valid data) */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Booking Gan Day</h3>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                BR-A28: Luu lich su booking
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Ma</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Khach hang</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Bien so</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Dich vu</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Trang thai</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Thoi gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm font-medium text-indigo-600">{booking.id}</td>
                    <td className="px-6 py-3 text-sm text-slate-700">{booking.customerId}</td>
                    <td className="px-6 py-3 text-sm text-slate-900 font-medium">{booking.plateNumber}</td>
                    <td className="px-6 py-3 text-sm text-slate-700">{booking.services.join(', ')}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">{formatTimeAgo(booking.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* BR-A52: Audit Log */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-900">Audit Log</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded ml-2">
                  BR-A52: Luu audit log cho thao tac quan trong
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="px-6 py-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        log.action.includes('CREATE') ? 'bg-green-100' :
                        log.action.includes('DELETE') || log.action.includes('CANCEL') ? 'bg-red-100' :
                        log.action.includes('CHECK') ? 'bg-blue-100' :
                        'bg-slate-100'
                      }`}>
                        <AlertCircle className={`w-4 h-4 ${
                          log.action.includes('CREATE') ? 'text-green-600' :
                          log.action.includes('DELETE') || log.action.includes('CANCEL') ? 'text-red-600' :
                          log.action.includes('CHECK') ? 'text-blue-600' :
                          'text-slate-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{getAuditActionDescription(log.action)}</div>
                        <div className="text-sm text-slate-600 mt-1">{log.details}</div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{log.entityType}</span>
                          <span>{log.entityId}</span>
                          <span className="text-slate-300">|</span>
                          <span>Boi: {log.performedBy} ({log.performedByRole})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">{formatTimeAgo(log.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* BR-A15: Status History */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-900">Lich su Trang thai Booking</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded ml-2">
                  BR-A15: Luu lich su trang thai booking
                </span>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Booking</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Trang thai cu</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Trang thai moi</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Ly do</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Nguoi thuc hien</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Thoi gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentStatusHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm font-medium text-indigo-600">{entry.bookingId}</td>
                    <td className="px-6 py-3">
                      {entry.previousStatus ? (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[entry.previousStatus]}`}>
                          {entry.previousStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[entry.newStatus]}`}>
                        {entry.newStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{entry.reason || '-'}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {entry.changedBy} <span className="text-slate-400">({entry.changedByRole})</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">{formatTimeAgo(entry.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rules Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-800 mb-2">Audit & Logging Rules:</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>BR-A15: Moi thay doi trang thai booking duoc luu lai voi thoi gian va nguoi thuc hien</li>
              <li>BR-A28: Toan bo lich su booking duoc luu tru de theo doi va bao cao</li>
              <li>BR-A52: Cac thao tac quan trong nhu tao/huy booking, check-in/out deu duoc ghi audit log</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
