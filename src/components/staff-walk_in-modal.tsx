'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBookings } from '@/contexts/booking-context';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_SERVICES } from '@/lib/mock-data';
import { Booking, VehicleType } from '@/lib/types';

const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Bán Tải' },
  { value: 'van', label: 'Van' },
  { value: 'motorcycle', label: 'Xe Máy' },
];

interface StaffWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional – called after booking is successfully added to BookingContext */
  onSuccess?: () => void;
}

export default function StaffWalkInModal({
  isOpen,
  onClose,
  onSuccess,
}: StaffWalkInModalProps) {
  // ── BookingContext – single source of truth ──────────────────────────────
  const { addBooking, slots } = useBookings();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Available slots: not locked and has remaining capacity
  const availableSlots = slots.filter(
    (s) => !s.locked && s.currentBookings < s.maxCapacity
  );

  const activeServices = MOCK_SERVICES.filter((s) => s.active);

  // Derived values
  const selectedServices = activeServices.filter((s) =>
    selectedServiceIds.includes(s.id)
  );
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const handleSubmit = () => {
    setError('');

    if (!licensePlate.trim()) {
      setError('Vui lòng nhập biển số xe');
      return;
    }
    if (selectedServiceIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 dịch vụ');
      return;
    }
    if (!selectedSlotId) {
      setError('Vui lòng chọn khung giờ');
      return;
    }

    const selectedSlot = slots.find((s) => s.id === selectedSlotId);
    if (!selectedSlot) {
      setError('Khung giờ không hợp lệ');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Calculate end time from slot start + total service duration
    const [startH, startM] = selectedSlot.time.split(':').map(Number);
    const endTotalMin = startH * 60 + startM + totalDuration;
    const endTime = `${String(Math.floor(endTotalMin / 60)).padStart(2, '0')}:${String(endTotalMin % 60).padStart(2, '0')}`;

    // BR-A43: Walk-in must generate a queue ticket
    const queueTicket = `WI${today.replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;

    // Build the Booking object – goes directly into BookingContext (SSOT)
    // Walk-ins are immediately CONFIRMED; staff creates them on-site
    const newBooking: Booking = {
      id: `BK${Date.now()}`,
      // Walk-in customers are not registered users; use a unique guest ID
      customerId: `WALKIN-${Date.now()}`,
      plateNumber: licensePlate.trim().toUpperCase(),
      vehicleType,
      services: selectedServices.map((s) => s.name),
      serviceIds: selectedServiceIds,
      date: today,
      slotId: selectedSlotId,
      startTime: selectedSlot.time,
      endTime,
      // BR-A43: Walk-in bookings are confirmed immediately by staff
      status: 'CONFIRMED',
      isWalkIn: true,
      queueTicket,
      // Walk-ins are checked in at creation time
      checkInTime: now.toISOString(),
      checkinStaff: user?.id ?? 'staff',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Register in BookingContext – instantly visible in Staff Queue,
    // Manager Dashboard, and Booking History (BR-A43, BR-A44)
    addBooking(newBooking);

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setLicensePlate('');
    setVehicleType('sedan');
    setSelectedServiceIds([]);
    setSelectedSlotId('');
    setIsSubmitting(false);

    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            🚗 Tạo Đơn Walk-In
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-2">

          {/* ── Customer Info (optional) ─────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Thông tin khách hàng (tuỳ chọn)
            </p>
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ── Vehicle Info ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Thông tin xe *
            </p>
            <input
              type="text"
              placeholder="Biển số xe (VD: 29A-12345)"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {VEHICLE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* ── Service Selection ─────────────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Dịch vụ * ({selectedServiceIds.length} đã chọn
              {totalDuration > 0 && ` · ${totalDuration} phút`})
            </p>
            <div className="space-y-2">
              {activeServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Checkbox indicator */}
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {service.duration} phút · {service.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-blue-600 ml-2">
                        {formatPrice(service.price)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Running total */}
            {selectedServiceIds.length > 0 && (
              <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-green-700">
                  Tổng cộng
                </span>
                <span className="text-base font-bold text-green-700">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            )}
          </div>

          {/* ── Slot Selection ───────────────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Khung giờ *
            </p>
            {availableSlots.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg border">
                Không có khung giờ trống
              </div>
            ) : (
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn khung giờ --</option>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.time} — Còn{' '}
                    {slot.maxCapacity - slot.currentBookings}/
                    {slot.maxCapacity} chỗ ({slot.duration} phút)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ── Error message ────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ── Footer actions ───────────────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang tạo...' : '✓ Tạo Đơn'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}