'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  Timer,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Package,
  CreditCard,
  MapPin,
  User,
  Save,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Booking, BookingStatus, Service, TimeSlot } from '@/lib/types';
import { MOCK_SERVICES, MOCK_TIME_SLOTS } from '@/lib/mock-data';
import { useBookings } from '@/contexts/booking-context';

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING_CHECKIN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
  CHECKED_IN: 'bg-orange-100 text-orange-700 border-orange-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_CHECKIN: 'Chờ check-in',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã check-in',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
  REJECTED: 'Bị từ chối',
};

interface BookingDetailSheetProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: () => void;
}

export default function BookingDetailSheet({
  booking,
  open,
  onOpenChange,
  onCancelled,
}: BookingDetailSheetProps) {
  const { updateBooking, cancelBooking, slots } = useBookings();
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Edit state
  const [editedServices, setEditedServices] = useState<string[]>([]);
  const [editedSlotId, setEditedSlotId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset edit state when booking changes
  useEffect(() => {
    if (booking) {
      setEditedServices(booking.serviceIds);
      setEditedSlotId(booking.slotId);
    }
    setIsEditing(false);
  }, [booking]);

  if (!booking) return null;

  const bookingServices = MOCK_SERVICES.filter((s) =>
    booking.serviceIds.includes(s.id)
  );
  const totalPrice = bookingServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = bookingServices.reduce((sum, s) => sum + s.duration, 0);

  const canEdit = booking.status === 'PENDING_CHECKIN';
  const canCancel = booking.status === 'PENDING_CHECKIN';

  // Get available slots for editing
  const availableSlots = slots.filter(
    (slot) =>
      slot.date === booking.date &&
      !slot.locked &&
      (slot.currentBookings < slot.maxCapacity || slot.id === booking.slotId)
  );

  // Calculate edited booking total
  const editedBookingServices = MOCK_SERVICES.filter((s) =>
    editedServices.includes(s.id)
  );
  const editedTotalPrice = editedBookingServices.reduce(
    (sum, s) => sum + s.price,
    0
  );
  const editedTotalDuration = editedBookingServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  const handleServiceToggle = (serviceId: string) => {
    setEditedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSaveEdit = async () => {
    if (editedServices.length === 0) {
      alert('Vui lòng chọn ít nhất một dịch vụ');
      return;
    }

    setIsSaving(true);

    const selectedSlot = slots.find((s) => s.id === editedSlotId);
    const serviceNames = MOCK_SERVICES.filter((s) =>
      editedServices.includes(s.id)
    ).map((s) => s.name);

    updateBooking(booking.id, {
      serviceIds: editedServices,
      services: serviceNames,
      slotId: editedSlotId,
      startTime: selectedSlot?.time || booking.startTime,
    });

    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 500);
  };

  const handleCancelBooking = () => {
    setIsCancelling(true);
    cancelBooking(booking.id);

    setTimeout(() => {
      setIsCancelling(false);
      setShowCancelDialog(false);
      onOpenChange(false);
      onCancelled?.();
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
          <div className="flex h-full flex-col">
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="h-1.5 w-12 rounded-full bg-slate-300" />
            </div>

            <SheetHeader className="border-b px-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-lg">Chi tiết đặt lịch</SheetTitle>
                  <SheetDescription className="font-mono text-xs">
                    {booking.id}
                  </SheetDescription>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[booking.status]}`}
                >
                  {STATUS_LABELS[booking.status]}
                </span>
              </div>
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-6 p-4">
                  {/* Service Selection */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Package className="h-4 w-4" />
                      Chọn dịch vụ
                    </h3>
                    <div className="space-y-2">
                      {MOCK_SERVICES.filter((s) => s.active).map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceToggle(service.id)}
                          className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                            editedServices.includes(service.id)
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-slate-900">
                                {service.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {service.duration} phút
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-indigo-600">
                                {service.priceDisplay}
                              </div>
                              {editedServices.includes(service.id) && (
                                <CheckCircle2 className="ml-auto mt-1 h-4 w-4 text-indigo-500" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slot Selection */}
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Clock className="h-4 w-4" />
                      Chọn khung giờ
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setEditedSlotId(slot.id)}
                          className={`rounded-lg border-2 px-3 py-2 text-center text-sm transition-all ${
                            editedSlotId === slot.id
                              ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-700">
                      Tổng kết chỉnh sửa
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dịch vụ:</span>
                        <span>{editedServices.length} dịch vụ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thời gian:</span>
                        <span>{editedTotalDuration} phút</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-700">Tổng tiền:</span>
                        <span className="text-indigo-600">
                          {formatCurrency(editedTotalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-6 p-4">
                  {/* Vehicle Info */}
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Car className="h-4 w-4" />
                      Thông tin xe
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Biển số</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {booking.plateNumber}
                        </span>
                      </div>
                      {booking.vehicleType && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Loại xe
                          </span>
                          <span className="capitalize text-slate-900">
                            {booking.vehicleType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Calendar className="h-4 w-4" />
                      Thời gian hẹn
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Ngày</span>
                        <span className="font-semibold text-slate-900">
                          {booking.date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Khung giờ
                        </span>
                        <span className="text-slate-900">
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>
                      {booking.checkInTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Check-in
                          </span>
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {new Date(booking.checkInTime).toLocaleTimeString(
                              'vi-VN',
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </span>
                        </div>
                      )}
                      {booking.checkOutTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            Check-out
                          </span>
                          <span className="text-slate-900">
                            {new Date(booking.checkOutTime).toLocaleTimeString(
                              'vi-VN',
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Package className="h-4 w-4" />
                      Dịch vụ đã chọn
                    </div>
                    <div className="space-y-2">
                      {bookingServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between rounded-lg bg-white p-3"
                        >
                          <div>
                            <div className="font-medium text-slate-900">
                              {service.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {service.duration} phút
                            </div>
                          </div>
                          <div className="font-semibold text-indigo-600">
                            {service.priceDisplay}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="rounded-lg border-2 border-indigo-100 bg-indigo-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-700">
                      <CreditCard className="h-4 w-4" />
                      Thanh toán
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          Tổng thời gian dự kiến
                        </span>
                        <span className="text-slate-900">
                          {totalDuration} phút
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-indigo-700">Tổng tiền</span>
                        <span className="text-indigo-600">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {booking.status === 'REJECTED' && booking.rejectionReason && (
                    <div className="rounded-lg bg-rose-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700">
                        <XCircle className="h-4 w-4" />
                        Lý do từ chối
                      </div>
                      <p className="text-sm text-rose-600">
                        {booking.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Expiry Warning */}
                  {booking.status === 'PENDING_CHECKIN' && booking.expiresAt && (
                    <div className="rounded-lg bg-amber-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-amber-700">
                        <Timer className="h-4 w-4" />
                        <span>
                          Vui lòng check-in trước{' '}
                          <strong>
                            {new Date(booking.expiresAt).toLocaleString(
                              'vi-VN'
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <SheetFooter className="border-t bg-white p-4">
              {isEditing ? (
                <div className="flex w-full gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Hủy
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSaveEdit}
                    disabled={isSaving || editedServices.length === 0}
                  >
                    {isSaving ? (
                      <>Đang lưu...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex w-full gap-3">
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hủy lịch
                    </Button>
                  )}
                  {!canEdit && !canCancel && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => onOpenChange(false)}
                    >
                      Đóng
                    </Button>
                  )}
                </div>
              )}
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận hủy lịch
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy lịch đặt này? Tiền thanh toán sẽ được
              hoàn lại dưới dạng voucher có giá trị tương đương.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-slate-50 p-3">
            <div className="mb-1 text-sm font-semibold text-slate-700">
              Thông tin đơn hủy
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đặt lịch:</span>
                <span className="font-mono">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dịch vụ:</span>
                <span>{booking.services.join(', ')}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Hoàn lại:</span>
                <span className="text-green-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Quay lại
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
