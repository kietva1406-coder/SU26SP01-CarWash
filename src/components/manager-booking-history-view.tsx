'use client';

import { useState, useMemo } from 'react';
import { History, Search, X, ZoomIn } from 'lucide-react';
import { useBookings } from '@/contexts/booking-context';
import { MOCK_USERS } from '@/lib/mock-data';
import { Booking } from '@/lib/types';

// ── Image Gallery Modal ───────────────────────────────────────────────────────
interface ImageGalleryModalProps {
  isOpen: boolean;
  images: string[];
  title: string;
  onClose: () => void;
}

function ImageGalleryModal({
  isOpen,
  images,
  title,
  onClose,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Main image */}
        <div
          className="relative bg-black flex items-center justify-center"
          style={{ height: '400px' }}
        >
          <img
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <button
            onClick={() =>
              setCurrentIndex((i) => (i - 1 + images.length) % images.length)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tiếp
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2 p-4 bg-gray-100">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`rounded overflow-hidden border-2 transition ${
                  idx === currentIndex ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-16 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStaffName(staffId?: string): string {
  if (!staffId) return 'Không xác định';
  const staff = MOCK_USERS.find((u) => u.id === staffId);
  return staff?.name ?? staffId;
}

function getCustomerName(customerId: string): string {
  if (customerId.startsWith('WALKIN-') || customerId === 'WALK-IN') {
    return 'Khách Walk-In';
  }
  const user = MOCK_USERS.find((u) => u.id === customerId);
  return user?.name ?? customerId;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ManagerBookingHistoryView() {
  // Load completed bookings directly from BookingContext (SSOT).
  // This view auto-updates the moment Staff completes a check-out — no local
  // mock data or manual refresh needed (BR-A28, BR-A39).
  const { bookings } = useBookings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [galleryType, setGalleryType] = useState<'checkin' | 'checkout'>('checkin');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // ── Filter only COMPLETED bookings ───────────────────────────────────────
  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'COMPLETED'),
    [bookings]
  );

  // ── Apply search ─────────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return completedBookings;
    return completedBookings.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        getCustomerName(b.customerId).toLowerCase().includes(q) ||
        b.plateNumber.toLowerCase().includes(q) ||
        b.services.join(' ').toLowerCase().includes(q)
    );
  }, [completedBookings, searchQuery]);

  const openGallery = (booking: Booking, type: 'checkin' | 'checkout') => {
    setSelectedBooking(booking);
    setGalleryType(type);
    setIsGalleryOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="w-8 h-8 text-indigo-600" />
            Lịch Sử Booking
          </h1>
          <p className="text-gray-600 mt-1">
            Đồng bộ thời gian thực — cập nhật ngay khi Staff hoàn thành dịch vụ
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-700 font-semibold text-2xl">
            {filteredBookings.length}
          </div>
          <div className="text-green-600 text-sm">Booking hoàn thành</div>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm theo mã, khách hàng, biển số, dịch vụ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ── Booking cards ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center">
            <p className="text-gray-600">Chưa có booking hoàn thành nào</p>
            <p className="text-gray-400 text-sm mt-1">
              Danh sách sẽ cập nhật khi Staff hoàn thành check-out
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-6 rounded-lg border hover:shadow-lg transition"
            >
              {/* ── Booking summary ─────────────────────────────────────── */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {booking.services.join(', ')}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {booking.vehicleType && `${booking.vehicleType} · `}
                      Biển số{' '}
                      <span className="font-mono font-medium">
                        {booking.plateNumber}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.isWalkIn && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                        Walk-In
                      </span>
                    )}
                    <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      Hoàn Thành
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>Khách hàng: {getCustomerName(booking.customerId)}</p>
                  <p>
                    Mã booking:{' '}
                    <span className="font-mono">{booking.id}</span>
                  </p>
                  {booking.queueTicket && (
                    <p>
                      Walk-In ticket:{' '}
                      <span className="font-mono text-purple-600">
                        {booking.queueTicket}
                      </span>
                    </p>
                  )}
                  <p>
                    Hoàn thành:{' '}
                    {new Date(
                      booking.completedAt ?? booking.updatedAt
                    ).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* ── Check-In / Check-Out detail ─────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Check-In */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Check-In</h4>
                  <div className="text-sm text-blue-800 space-y-1.5 mb-3">
                    <p>Nhân viên: {getStaffName(booking.checkinStaff)}</p>
                    <p>
                      Thời gian:{' '}
                      {booking.checkInTime
                        ? new Date(booking.checkInTime).toLocaleTimeString('vi-VN')
                        : 'N/A'}
                    </p>
                    {booking.checkinNotes && (
                      <p className="italic text-blue-700">
                        Ghi chú: {booking.checkinNotes}
                      </p>
                    )}
                  </div>

                  {booking.checkinPhotos && booking.checkinPhotos.length > 0 ? (
                    <>
                      <button
                        onClick={() => openGallery(booking, 'checkin')}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <ZoomIn size={16} />
                        Xem {booking.checkinPhotos.length} ảnh Check-In
                      </button>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {booking.checkinPhotos.slice(0, 3).map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Check-in ${idx + 1}`}
                            className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-75 transition"
                            onClick={() => openGallery(booking, 'checkin')}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-blue-400 italic">
                      Không có ảnh check-in
                    </p>
                  )}
                </div>

                {/* Check-Out */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">Check-Out</h4>
                  <div className="text-sm text-green-800 space-y-1.5 mb-3">
                    <p>Nhân viên: {getStaffName(booking.checkoutStaff)}</p>
                    <p>
                      Thời gian:{' '}
                      {booking.checkOutTime
                        ? new Date(booking.checkOutTime).toLocaleTimeString('vi-VN')
                        : 'N/A'}
                    </p>
                    {booking.checkoutNotes && (
                      <p className="italic text-green-700">
                        Ghi chú: {booking.checkoutNotes}
                      </p>
                    )}
                  </div>

                  {booking.checkoutPhotos && booking.checkoutPhotos.length > 0 ? (
                    <>
                      <button
                        onClick={() => openGallery(booking, 'checkout')}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <ZoomIn size={16} />
                        Xem {booking.checkoutPhotos.length} ảnh Check-Out
                      </button>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {booking.checkoutPhotos.slice(0, 3).map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Check-out ${idx + 1}`}
                            className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-75 transition"
                            onClick={() => openGallery(booking, 'checkout')}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-green-400 italic">
                      Không có ảnh check-out
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Image Gallery Modal ──────────────────────────────────────────── */}
      {selectedBooking && (
        <ImageGalleryModal
          isOpen={isGalleryOpen}
          images={
            galleryType === 'checkin'
              ? selectedBooking.checkinPhotos ?? []
              : selectedBooking.checkoutPhotos ?? []
          }
          title={`${galleryType === 'checkin' ? 'Ảnh Check-In' : 'Ảnh Check-Out'} — ${selectedBooking.services.join(', ')}`}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </div>
  );
}
