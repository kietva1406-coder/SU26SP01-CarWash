'use client';

import { useState } from 'react';
import { Calendar, Clock, Car, Eye, EyeOff, Ticket, Info, CheckCircle2, XCircle, Timer, AlertTriangle, Trash2, X, Gift, Tag, CreditCard, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/contexts/booking-context';
import { Booking, BookingStatus } from '@/lib/types';
import { canViewBooking } from '@/lib/permissions';
import { isBookingExpired } from '@/lib/booking-validation';
import BookingDetailSheet from '@/components/booking-detail-sheet';

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING_CHECKIN: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CHECKED_IN: 'bg-orange-100 text-orange-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-slate-100 text-slate-500',
  REJECTED: 'bg-rose-100 text-rose-700',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_CHECKIN: 'Đợi check-in',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã check-in',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
  REJECTED: 'Bị từ chối',
};

export default function CustomerMyBookingsView() {
  const { user } = useAuth();
  const { bookings, cancelBooking, refundVouchers, getRefundVouchersByCustomer } = useBookings();
  const [showAll, setShowAll] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedRejectedBooking, setSelectedRejectedBooking] = useState<Booking | null>(null);
  const [showRefundVouchers, setShowRefundVouchers] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  if (!user) return null;

  // BR-A27: Customer chỉ xem booking của mình
  const myBookings = bookings.filter((booking) =>
    canViewBooking(user.role, booking.customerId, user.id)
  );

  // Get refund vouchers for this customer
  const myRefundVouchers = getRefundVouchersByCustomer(user.id);

  const allBookings = bookings;
  const displayBookings = showAll ? allBookings : myBookings;

  // Handle cancel booking - chỉ cho phép khi chưa check-in (PENDING_CHECKIN)
  const handleCancelBooking = (booking: Booking) => {
    if (booking.status !== 'PENDING_CHECKIN') {
      alert('Không thể hủy booking đã được xác nhận hoặc đang thực hiện!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn hủy booking ${booking.id}?`)) {
      setCancellingId(booking.id);
      cancelBooking(booking.id);
      setTimeout(() => setCancellingId(null), 500);
    }
  };

  // Kiểm tra xem booking có thể hủy được không
  const canCancelBooking = (booking: Booking) => {
    return booking.status === 'PENDING_CHECKIN' && booking.customerId === user.id;
  };

  // Open booking detail
  const handleOpenBookingDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailSheet(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lịch Đặt Của Tôi</h2>
          <p className="text-slate-500 mt-1">
            BR-A27: Bạn chỉ có thể xem booking của chính mình
          </p>
        </div>

        {/* Demo toggle to show restriction */}
        <button
          onClick={() => setShowAll(!showAll)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showAll
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {showAll ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showAll ? 'Đang xem tất cả (Vi phạm BR-A27)' : 'Chỉ xem booking của tôi'}
        </button>
      </div>

      {/* Refund Vouchers Notification */}
      {myRefundVouchers.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Bạn có {myRefundVouchers.length} voucher hoàn tiền!</h4>
                <p className="text-sm text-green-600">Tiền từ các đơn hủy đã được chuyển thành voucher</p>
              </div>
            </div>
            <button
              onClick={() => setShowRefundVouchers(!showRefundVouchers)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              {showRefundVouchers ? 'Ẩn voucher' : 'Xem voucher'}
            </button>
          </div>

          {showRefundVouchers && (
            <div className="mt-4 space-y-3">
              {myRefundVouchers.map((voucher) => (
                <div key={voucher.id} className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="font-mono font-bold text-green-700">{voucher.code}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.amount)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{voucher.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Từ booking: {voucher.bookingId}</span>
                    <span>HSD: {new Date(voucher.validUntil).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-green-600 mt-2">
                <Info className="w-3 h-3 inline mr-1" />
                Sử dụng mã voucher khi đặt lịch để được giảm giá
              </p>
            </div>
          )}
        </div>
      )}

      {/* Warning when showing all */}
      {showAll && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">
            <strong>Cảnh báo:</strong> Đây là chế độ demo. Trong thực tế, customer không được phép xem booking của người khác theo BR-A27.
          </p>
        </div>
      )}

      {/* Business Rules Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-slate-500" />
          <h4 className="font-semibold text-slate-700">Thông tin Booking</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <strong className="text-slate-700">Booking Rules:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>BR-A53: Mỗi booking có ID duy nhất</li>
              <li>BR-A08: Booking có thời gian bắt đầu và kết thúc</li>
              <li>BR-A48: Mỗi booking thuộc về 1 customer</li>
              <li>BR-A04: Mỗi booking có ít nhất 1 dịch vụ</li>
            </ul>
          </div>
          <div>
            <strong className="text-slate-700">Check-in Rules:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>BR-A05: Phải check-in trước khi phục vụ</li>
              <li>BR-A12: Booking quá giờ tự động expired</li>
              <li>BR-A13: Booking expired không check-in</li>
              <li>BR-A14: Booking canceled không phục vụ</li>
              <li>BR-A19: Ghi nhận check-in time thực tế</li>
              <li>Chỉ có thể hủy khi chưa check-in</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Tổng booking</div>
          <div className="text-2xl font-bold text-indigo-600">{myBookings.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Đợi check-in</div>
          <div className="text-2xl font-bold text-yellow-600">
            {myBookings.filter((b) => b.status === 'PENDING_CHECKIN').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Đã xác nhận</div>
          <div className="text-2xl font-bold text-green-600">
            {myBookings.filter((b) => b.status === 'CONFIRMED').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Đang thực hiện</div>
          <div className="text-2xl font-bold text-blue-600">
            {myBookings.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'CHECKED_IN').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Hoàn thành</div>
          <div className="text-2xl font-bold text-emerald-600">
            {myBookings.filter((b) => b.status === 'COMPLETED').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Bị từ chối</div>
          <div className="text-2xl font-bold text-rose-600">
            {myBookings.filter((b) => b.status === 'REJECTED').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Hết hạn/Hủy</div>
          <div className="text-2xl font-bold text-red-600">
            {myBookings.filter((b) => b.status === 'CANCELLED' || b.status === 'EXPIRED').length}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Mã Booking (BR-A53)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Biển Số (BR-A47)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Dịch Vụ (BR-A04)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Thời Gian (BR-A08)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Check-in (BR-A19)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Thao Tác
              </th>
              <td className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                
              </td>
              {showAll && (
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Customer (BR-A48)
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayBookings.map((booking) => {
              const isExpiring = booking.status === 'PENDING_CHECKIN' && isBookingExpired(booking);
              
              return (
                <tr
                  key={booking.id}
                  onClick={() => handleOpenBookingDetail(booking)}
                  className={`group hover:bg-indigo-50 hover:shadow-sm transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500 ${
                    showAll && booking.customerId !== user.id ? 'opacity-50' : ''
                  } ${isExpiring ? 'bg-red-50/50 hover:bg-red-100' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-indigo-600">{booking.id}</div>
                    {booking.isWalkIn && booking.queueTicket && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                        <Ticket className="w-3 h-3" />
                        {booking.queueTicket}
                      </div>
                    )}
                    {isExpiring && (
                      <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <Timer className="w-3 h-3" />
                        Sắp hết hạn!
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-sm font-medium text-slate-900">{booking.plateNumber}</span>
                        {booking.vehicleType && (
                          <div className="text-xs text-slate-500 capitalize">{booking.vehicleType}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {booking.services.join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {booking.date}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {booking.checkInTime ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <div>
                          <div>{new Date(booking.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                          {booking.checkOutTime && (
                            <div className="text-xs text-slate-500">
                              Out: {new Date(booking.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : booking.status === 'CANCELLED' ? (
                      <div className="flex items-center gap-1 text-red-500">
                        <XCircle className="w-4 h-4" />
                        <span>BR-A14</span>
                      </div>
                    ) : booking.status === 'EXPIRED' ? (
                      <div className="flex items-center gap-1 text-slate-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>BR-A13</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>Chờ check-in</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {booking.status === 'REJECTED' ? (
                      <button
                        onClick={() => setSelectedRejectedBooking(booking)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                          STATUS_COLORS[booking.status]
                        }`}
                        title="Nhấn để xem lý do từ chối"
                      >
                        {STATUS_LABELS[booking.status]}
                        <Info className="w-3 h-3" />
                      </button>
                    ) : (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          STATUS_COLORS[booking.status]
                        }`}
                      >
                        {STATUS_LABELS[booking.status]}
                      </span>
                    )}
                    {booking.isWalkIn && (
                      <span className="ml-2 inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                        Walk-in
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {canCancelBooking(booking) ? (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        disabled={cancellingId === booking.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          cancellingId === booking.id
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        {cancellingId === booking.id ? 'Đang hủy...' : 'Hủy'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {booking.status === 'CANCELLED' ? 'Đã hủy' : 
                         booking.status === 'EXPIRED' ? 'Đã hết hạn' :
                         booking.status === 'COMPLETED' ? 'Hoàn thành' :
                         booking.status === 'REJECTED' ? 'Bị từ chối' :
                         'Không thể hủy'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-slate-400 group-hover:text-indigo-600 transition-colors hidden sm:inline">
                        Xem chi tiết
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </td>
                  {showAll && (
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {booking.customerId}
                      {booking.customerId === user.id && (
                        <span className="ml-2 text-green-600 font-medium">(Bạn)</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {displayBookings.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Bạn chưa có booking nào
          </div>
        )}
      </div>

      {/* Check-in Reminders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Info className="w-5 h-5" />
            <span className="font-medium">BR-A05: Check-in trước khi phục vụ</span>
          </div>
          <p className="text-sm text-amber-600 mt-1">
            Xe phải được check-in tại quầy hoặc quét QR trước khi nhân viên bắt đầu rửa xe.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">BR-A12: Booking tự động hết hạn</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Nếu không check-in trong vòng 15 phút sau giờ kết thúc, booking sẽ tự động hết hạn.
          </p>
        </div>
      </div>

      {/* Booking Detail Sheet */}
      <BookingDetailSheet
        booking={selectedBooking}
        open={showDetailSheet}
        onOpenChange={setShowDetailSheet}
      />
    </div>
  );
}
