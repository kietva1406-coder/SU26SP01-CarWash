'use client';

import { useState, useMemo } from 'react';
import { Check, AlertCircle, Clock, Users, Info, Award, Percent, ChevronLeft, Ticket, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/contexts/booking-context';
import { MOCK_SERVICES, VEHICLE_TYPES, MOCK_LOYALTY_TRANSACTIONS, MOCK_CUSTOMER_VEHICLES } from '@/lib/mock-data';
import { TimeSlot, Service, Booking, VehicleType, ValidationError, Voucher, DiscountBreakdown, ExtendedLoyaltyTier, EXTENDED_LOYALTY_CONFIG } from '@/lib/types';
import { 
  validateBooking, 
  isSlotAvailable, 
  hasActiveBooking,
  generateBookingId,
  calculateEndTime
} from '@/lib/booking-validation';
import { calculateTotalDiscount, formatCurrency, calculateTierFromPoints, getTierInfo } from '@/lib/discount-calculator';
import { VoucherSelector } from './voucher-selector';
import BookingModal from './booking-modal';
import ServiceSelectionView from './service-selection-view';

export default function CustomerBookingView() {
  const { user } = useAuth();
  const { bookings, slots, addBooking } = useBookings();
  
  // Get customer's registered vehicles
  const customerVehicles = useMemo(() => 
    MOCK_CUSTOMER_VEHICLES.filter(v => v.customerId === user?.id),
    [user?.id]
  );
  
  // Step tracking
  const [step, setStep] = useState<'services' | 'booking'>('services');
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [showModal, setShowModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [lastBookingId, setLastBookingId] = useState<string>('');
  
  // Voucher state
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [discountBreakdown, setDiscountBreakdown] = useState<DiscountBreakdown | null>(null);

  const activeServices = MOCK_SERVICES.filter((s) => s.active);

  // Initialize selected vehicle from primary or first registered vehicle
  useMemo(() => {
    if (!selectedVehicleId && customerVehicles.length > 0) {
      const primaryVehicle = customerVehicles.find(v => v.isPrimary);
      if (primaryVehicle) {
        setSelectedVehicleId(primaryVehicle.id);
        setVehicleType(primaryVehicle.vehicleType);
      } else {
        setSelectedVehicleId(customerVehicles[0].id);
        setVehicleType(customerVehicles[0].vehicleType);
      }
    }
  }, [selectedVehicleId, customerVehicles]);

  // Calculate customer loyalty tier and discount using extended system (5 tiers)
  const customerLoyalty = useMemo(() => {
    if (!user) return { points: 0, tier: 'UNRANK' as ExtendedLoyaltyTier, discount: 0 };
    
    const transactions = MOCK_LOYALTY_TRANSACTIONS.filter(
      t => t.customerId === user.id && t.status === 'COMPLETED'
    );
    
    const totalPoints = transactions.reduce((sum, t) => {
      if (t.type === 'EARN') return sum + t.points;
      if (t.type === 'REDEEM') return sum - t.points;
      return sum;
    }, 0);
    
    const tier = calculateTierFromPoints(totalPoints);
    const discount = EXTENDED_LOYALTY_CONFIG.tierDiscounts[tier];
    
    return { points: totalPoints, tier, discount };
  }, [user]);

  const tierDisplayInfo = useMemo(() => getTierInfo(customerLoyalty.tier), [customerLoyalty.tier]);

  // Calculate total duration of selected services (BR-A21)
  const totalDuration = useMemo(() => {
    return activeServices
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.duration, 0);
  }, [activeServices, selectedServices]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return activeServices
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  }, [activeServices, selectedServices]);

  // Calculate discounted price based on loyalty tier and voucher
  const currentBreakdown = useMemo(() => {
    return calculateTotalDiscount(totalPrice, customerLoyalty.tier, selectedVoucher || undefined);
  }, [totalPrice, customerLoyalty.tier, selectedVoucher]);

  // Handle voucher selection
  const handleVoucherSelect = (voucher: Voucher | null, breakdown: DiscountBreakdown) => {
    setSelectedVoucher(voucher);
    setDiscountBreakdown(breakdown);
  };

  // Check if vehicle has active booking (BR-A07)
  const vehicleHasActiveBooking = useMemo(() => {
    if (!selectedVehicleId || customerVehicles.length === 0) return false;
    const selectedVehicle = customerVehicles.find(v => v.id === selectedVehicleId);
    if (!selectedVehicle) return false;
    return hasActiveBooking(selectedVehicle.plateNumber, bookings);
  }, [selectedVehicleId, customerVehicles, bookings]);

  // Toggle service selection
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
    setValidationErrors([]);
  };

  // Handle service selection and move to booking step
  const handleServicesSelected = (serviceIds: string[]) => {
    setSelectedServices(serviceIds);
    setStep('booking');
  };

  // Handle back button from booking step
  const handleBackToServices = () => {
    setStep('services');
    setSelectedDate('');
    setSelectedSlot(null);
    setValidationErrors([]);
  };

  // Check slot availability with detailed info
  const getSlotInfo = (slot: TimeSlot) => {
    const availability = isSlotAvailable(slot);
    const canFitServices = slot.duration >= totalDuration;
    
    return {
      ...availability,
      canFitServices,
      spotsLeft: slot.maxCapacity - slot.currentBookings,
    };
  };

  const handleConfirm = () => {
    if (!user || !selectedVehicleId) return;

    const selectedVehicle = customerVehicles.find(v => v.id === selectedVehicleId);
    if (!selectedVehicle) return;

    const slot = slots.find(s => s.id === selectedSlot);
    if (!slot) return;

    const startTime = slot.time;
    const selectedServiceObjects = activeServices.filter(s => selectedServices.includes(s.id));
    const endTime = calculateEndTime(startTime, selectedServiceObjects);
    const bookingId = generateBookingId();

    // Create booking object for validation
    const newBooking: Booking = {
      id: bookingId, // BR-A53: Unique booking ID
      customerId: user.id, // BR-A48: Single customer
      plateNumber: selectedVehicle.plateNumber,
      vehicleType: selectedVehicle.vehicleType,
      serviceIds: selectedServices, // BR-A04: At least 1 service
      services: selectedServiceObjects.map(s => s.name),
      date: selectedDate,
      slotId: selectedSlot!, // BR-A01: Valid slot
      startTime, // BR-A08: Start time
      endTime, // BR-A08: End time
      status: 'PENDING_CHECKIN',
      isWalkIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Validate booking with all rules
    const validation = validateBooking(
      newBooking,
      slots,
      activeServices,
      bookings,
      user.id
    );

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Add booking to context - this will update state and show in "Lịch Của Tôi"
    addBooking(newBooking);
    setLastBookingId(bookingId);

    // Clear form and show success modal
    setValidationErrors([]);
    setShowModal(true);
    
    // Reset form after successful booking
    setSelectedServices([]);
    setSelectedDate('');
    setSelectedSlot(null);
    // Keep selectedVehicleId as is - user can reuse their registered vehicle
  };

  const selectedSlotData = slots.find(s => s.id === selectedSlot);
  const canSubmit = selectedServices.length > 0 && 
                   selectedDate && 
                   selectedSlot && 
                   selectedVehicleId && 
                   !vehicleHasActiveBooking;

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <div className={`flex-1 h-1 rounded-full transition-colors ${step === 'services' ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        <span className="text-sm font-medium text-slate-600">Bước 1: Chọn dịch vụ</span>
        <div className={`flex-1 h-1 rounded-full transition-colors ${step === 'booking' ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        <span className="text-sm font-medium text-slate-600">Bước 2: Đặt lịch</span>
      </div>

      {/* Validation Errors Display */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-700 mb-2">Lỗi đặt lịch</h4>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">
                    <span className="font-medium">{error.rule}:</span> {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Service Selection */}
      {step === 'services' && (
        <ServiceSelectionView 
          onServiceSelected={handleServicesSelected}
          selectedServices={selectedServices}
        />
      )}

      {/* Step 2: Booking Details */}
      {step === 'booking' && (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={handleBackToServices}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại chọn dịch vụ
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Services */}
            <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Chọn Dịch Vụ</h2>
            <div className="text-sm text-slate-500">
              BR-A04: Phải chọn ít nhất 1 dịch vụ
            </div>
          </div>
          
          <div className="space-y-3">
            {activeServices.map((service) => (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedServices.includes(service.id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{service.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {service.id}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{service.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration} phút (BR-A21)
                      </span>
                    </div>
                  </div>
                  {selectedServices.includes(service.id) && (
                    <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-indigo-600 font-bold mt-2">{service.priceDisplay}</p>
              </button>
            ))}
          </div>

          {/* Selection Summary */}
          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">Tong ket</h4>
              <div className="flex justify-between text-sm">
                <span className="text-indigo-700">Tong thoi gian:</span>
                <span className="font-semibold text-indigo-900">{totalDuration} phut</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-indigo-700">Gia goc:</span>
                <span className="font-semibold text-indigo-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              {currentBreakdown.rankDiscountAmount > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-green-600 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Giam theo hang {tierDisplayInfo.name} ({currentBreakdown.rankDiscountPercent}%):
                  </span>
                  <span className="font-semibold text-green-600">
                    -{formatCurrency(currentBreakdown.rankDiscountAmount)}
                  </span>
                </div>
              )}
              {currentBreakdown.voucherDiscountAmount > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-green-600 flex items-center gap-1">
                    <Ticket className="w-3 h-3" />
                    Voucher {currentBreakdown.voucherCode}:
                  </span>
                  <span className="font-semibold text-green-600">
                    -{formatCurrency(currentBreakdown.voucherDiscountAmount)}
                  </span>
                </div>
              )}
              {currentBreakdown.totalDiscountAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-indigo-200">
                    <span className="text-indigo-700 font-semibold">Thanh tien:</span>
                    <span className="font-bold text-indigo-900 text-lg">
                      {formatCurrency(currentBreakdown.finalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2 py-1.5 bg-green-100 rounded-lg">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Tiet kiem {formatCurrency(currentBreakdown.totalDiscountAmount)} ({currentBreakdown.totalDiscountPercent}%)
                    </span>
                  </div>
                </>
              )}
              {currentBreakdown.totalDiscountAmount === 0 && (
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-indigo-200">
                  <span className="text-indigo-700 font-semibold">Thanh tien:</span>
                  <span className="font-bold text-indigo-900 text-lg">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Loyalty Tier Badge */}
          {user && (
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className={`w-5 h-5 ${tierDisplayInfo.color}`} />
                  <span className="text-sm font-medium text-slate-700">Hang thanh vien:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tierDisplayInfo.bgColor} ${tierDisplayInfo.color}`}>
                    {tierDisplayInfo.name}
                  </span>
                </div>
                <span className="text-sm text-slate-600">{customerLoyalty.points} diem</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Ban duoc giam {customerLoyalty.discount}% cho moi don dat lich!
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Booking Details */}
        <div className="space-y-6">
          {/* Customer Info (BR-A48, BR-A54) */}
          {user && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-indigo-700">
                <Info className="w-4 h-4" />
                <span>BR-A48: Mỗi booking thuộc 1 customer</span>
              </div>
              <p className="text-sm text-indigo-700 mt-2">
                <span className="font-medium">Đang đặt cho:</span> {user.name}
              </p>
              <p className="text-xs text-indigo-500 mt-1">ID: {user.id} (BR-A54: Unique)</p>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Chọn Ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null);
                setValidationErrors([]);
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Time Slots with Capacity Info - Only show after date is selected */}
          {selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Chọn Giờ
                </label>
                <span className="text-xs text-slate-500">
                  BR-A01, BR-A02, BR-A03, BR-A45
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => {
                  const info = getSlotInfo(slot);
                  const isDisabled = !info.available || !info.canFitServices;
                  
                  return (
                    <button
                      key={slot.id}
                      disabled={isDisabled}
                      onClick={() => {
                        setSelectedSlot(slot.id);
                        setValidationErrors([]);
                      }}
                      className={`py-3 px-3 rounded-lg font-medium transition-colors text-left ${
                        isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedSlot === slot.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{slot.time}</span>
                        {slot.locked && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                            Khóa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                        <Users className="w-3 h-3" />
                        <span>{info.spotsLeft}/{slot.maxCapacity} chỗ</span>
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        {slot.duration} phút
                      </div>
                      {!info.canFitServices && totalDuration > 0 && (
                        <div className="text-xs text-red-500 mt-1">
                          BR-A56: Slot ngắn hơn dịch vụ
                        </div>
                      )}
                      {info.spotsLeft === 0 && (
                        <div className="text-xs text-red-500 mt-1">
                          BR-A03: Đã đầy
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Hint to select date first */}
          {!selectedDate && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Vui lòng chọn ngày trước để xem các khung giờ có sẵn</span>
              </div>
            </div>
          )}

          {/* Vehicle Info (BR-A47) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Info className="w-4 h-4" />
              <span>BR-A47: Phải nhập vehicle info khi booking</span>
            </div>
            
            {customerVehicles.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">Chưa đăng ký biển số xe</p>
                <p className="text-xs text-yellow-700">Vui lòng đi đến phần "Điểm thưởng" để đăng ký biển số xe trước khi đặt lịch.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Chọn Biển Số Xe
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => {
                      setSelectedVehicleId(e.target.value);
                      const vehicle = customerVehicles.find(v => v.id === e.target.value);
                      if (vehicle) {
                        setVehicleType(vehicle.vehicleType);
                      }
                      setValidationErrors([]);
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                      vehicleHasActiveBooking ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- Chọn xe --</option>
                    {customerVehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber} ({VEHICLE_TYPES.find(vt => vt.value === vehicle.vehicleType)?.label})
                        {vehicle.isPrimary ? ' [Mặc định]' : ''}
                      </option>
                    ))}
                  </select>
                  {vehicleHasActiveBooking && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      BR-A07: Xe này đã có booking active
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Chọn từ các biển số xe đã đăng ký. Không thể chỉnh sửa tại đây.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Loại Xe (Tự động cập nhật)
                  </label>
                  <input
                    type="text"
                    value={VEHICLE_TYPES.find(vt => vt.value === vehicleType)?.label || 'Sedan'}
                    disabled
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Loại xe được xác định từ xe đã chọn</p>
                </div>
              </>
            )}

          {/* Booking Summary */}
          {selectedSlotData && selectedServices.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
              <h4 className="font-semibold text-slate-900">Chi tiết đặt lịch (BR-A08)</h4>
              <div className="flex justify-between">
                <span className="text-slate-600">Booking ID:</span>
                <span className="font-mono text-slate-900">{generateBookingId()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Thời gian bắt đầu:</span>
                <span className="font-semibold text-slate-900">{selectedSlotData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Thời gian kết thúc:</span>
                <span className="font-semibold text-slate-900">
                  {calculateEndTime(
                    selectedSlotData.time, 
                    activeServices.filter(s => selectedServices.includes(s.id))
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Voucher Selector */}
          {selectedServices.length > 0 && user && (
            <VoucherSelector
              customerId={user.id}
              customerTier={customerLoyalty.tier}
              orderAmount={totalPrice}
              serviceIds={selectedServices}
              selectedVoucher={selectedVoucher}
              onVoucherSelect={handleVoucherSelect}
            />
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Xác Nhận Đặt Lịch
          </button>

          {/* Validation Rules Info */}
          <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-500">
            <strong>Các quy tắc được kiểm tra:</strong>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li>BR-A01: Booking phải thuộc slot hợp lệ</li>
              <li>BR-A04: Phải có ít nhất 1 dịch vụ</li>
              <li>BR-A07: Một xe chỉ có 1 booking active</li>
              <li>BR-A08: Booking có start & end time</li>
              <li>BR-A45: Slot bị khóa không cho booking</li>
              <li>BR-A46: Kiểm tra conflict booking</li>
              <li>BR-A47: Phải nhập vehicle info</li>
              <li>BR-A53: Booking ID là duy nhất</li>
            </ul>
          </div>
        </div>

        {/* Validation Rules Info */}
        <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-500">
          <strong>Các quy tắc được kiểm tra:</strong>
          <ul className="mt-1 space-y-0.5 list-disc list-inside">
            <li>BR-A01: Booking phải thuộc slot hợp lệ</li>
            <li>BR-A04: Phải có ít nhất 1 dịch vụ</li>
            <li>BR-A07: Một xe chỉ có 1 booking active</li>
            <li>BR-A08: Booking có start & end time</li>
            <li>BR-A45: Slot bị khóa không cho booking</li>
            <li>BR-A46: Kiểm tra conflict booking</li>
            <li>BR-A47: Phải nhập vehicle info</li>
            <li>BR-A53: Booking ID là duy nhất</li>
          </ul>
        </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plateNumber={customerVehicles.find(v => v.id === selectedVehicleId)?.plateNumber || ''}
        service={activeServices.filter(s => selectedServices.includes(s.id)).map(s => s.name).join(', ')}
        date={selectedDate}
        time={selectedSlotData?.time || ''}
        customerId={user?.id || ''}
      />
    </div>
  );
}
