"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { useBookings } from "@/contexts/booking-context";
import { useAuth } from "@/contexts/auth-context";
import { MOCK_USERS } from "@/lib/mock-data";
import { Booking, BookingStatus } from "@/lib/types";
import StaffCheckInModal from "./staff-checkin-modal";
import StaffCheckOutModal from "./staff-checkout-modal";
import StaffWalkInModal from "./staff-walk_in-modal";

// ── Status display config ─────────────────────────────────────────────────────
const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  PENDING_CHECKIN: {
    label: "Chờ Check-In",
    color: "bg-yellow-100 text-yellow-700",
  },
  CONFIRMED: {
    label: "Chờ Check-In",
    color: "bg-yellow-100 text-yellow-700",
  },
  CHECKED_IN: {
    label: "Đang Thực Hiện",
    color: "bg-blue-100 text-blue-700",
  },
  IN_PROGRESS: {
    label: "Đang Thực Hiện",
    color: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    label: "Hoàn Thành",
    color: "bg-green-100 text-green-700",
  },
};

// ── Helper functions ──────────────────────────────────────────────────────────

/** Look up a display name from MOCK_USERS; walk-in guests get a generic label. */
function getCustomerName(customerId: string): string {
  if (customerId.startsWith("WALKIN-") || customerId === "WALK-IN") {
    return "Khách Walk-In";
  }
  const user = MOCK_USERS.find((u) => u.id === customerId);
  return user?.name ?? customerId;
}

/** BR-A05: A booking is ready for check-in when staff hasn't started yet. */
function canCheckIn(status: BookingStatus): boolean {
  return status === "PENDING_CHECKIN" || status === "CONFIRMED";
}

/** BR-A57: A booking is ready for check-out when service is in progress. */
function canCheckOut(status: BookingStatus): boolean {
  return status === "CHECKED_IN" || status === "IN_PROGRESS";
}

// ─────────────────────────────────────────────────────────────────────────────

export default function StaffQueueView() {
  // ── BookingContext – single source of truth ─────────────────────────────
  // All mutations go through updateBooking(), keeping every view in sync.
  const { bookings, updateBooking } = useBookings();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  // ── Queue: exclude terminal / irrelevant statuses ────────────────────────
  const queueBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status !== "CANCELLED" &&
          b.status !== "EXPIRED" &&
          b.status !== "REJECTED"
      ),
    [bookings]
  );

  // ── Summary stats ────────────────────────────────────────────────────────
  const assignedCount = useMemo(
    () => queueBookings.filter((b) => canCheckIn(b.status)).length,
    [queueBookings]
  );
  const inProgressCount = useMemo(
    () => queueBookings.filter((b) => canCheckOut(b.status)).length,
    [queueBookings]
  );
  const completedCount = useMemo(
    () => queueBookings.filter((b) => b.status === "COMPLETED").length,
    [queueBookings]
  );
  const walkInCount = useMemo(
    () => queueBookings.filter((b) => b.isWalkIn).length,
    [queueBookings]
  );

  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return queueBookings;
    return queueBookings.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.plateNumber.toLowerCase().includes(q) ||
        b.services.join(" ").toLowerCase().includes(q) ||
        getCustomerName(b.customerId).toLowerCase().includes(q)
    );
  }, [queueBookings, searchQuery]);

  // ── Check-In ─────────────────────────────────────────────────────────────
  const handleCheckIn = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCheckInModalOpen(true);
  };

  /**
   * Commit check-in to BookingContext.
   * BR-A05: car must be checked in before service.
   * BR-A19: record actual check-in time.
   * Changes propagate instantly to ManagerDashboard and BookingHistory.
   */
  const handleCheckInSubmit = (photos: string[], notes: string) => {
    if (!selectedBooking) return;
    updateBooking(selectedBooking.id, {
      status: "IN_PROGRESS",
      checkInTime: new Date().toISOString(),
      checkinPhotos: photos,
      checkinNotes: notes,
      checkinStaff: user?.id ?? "staff",
    });
    setIsCheckInModalOpen(false);
    setSelectedBooking(null);
  };

  // ── Check-Out ─────────────────────────────────────────────────────────────
  const handleCheckOut = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCheckOutModalOpen(true);
  };

  /**
   * Commit check-out to BookingContext.
   * BR-A57: checkout time must be after check-in time.
   * Setting status to COMPLETED triggers Manager History & revenue updates.
   */
  const handleCheckOutSubmit = (photos: string[], notes: string) => {
    if (!selectedBooking) return;
    const now = new Date().toISOString();
    updateBooking(selectedBooking.id, {
      status: "COMPLETED",
      checkOutTime: now,
      checkoutPhotos: photos,
      checkoutNotes: notes,
      checkoutStaff: user?.id ?? "staff",
      completedAt: now,
    });
    setIsCheckOutModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Hàng Đợi Công Việc</h1>
          <p className="text-gray-600 mt-1">
            Dữ liệu booking thời gian thực — đồng bộ với Dashboard &amp; Lịch sử
          </p>
          <button
            onClick={() => setIsWalkInOpen(true)}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
          >
            <Users size={16} />
            Tạo Đơn Walk-In
          </button>
        </div>

        {/* Walk-in badge */}
        {walkInCount > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center min-w-[80px]">
            <div className="text-purple-700 font-bold text-2xl">{walkInCount}</div>
            <div className="text-purple-600 text-xs">Walk-In</div>
          </div>
        )}
      </div>

      {/* ── Stats cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-gray-600 text-sm">Chờ Check-In</p>
          <p className="text-3xl font-bold text-yellow-600">{assignedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-gray-600 text-sm">Đang Thực Hiện</p>
          <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-gray-600 text-sm">Hoàn Thành</p>
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Tìm theo mã booking, biển số, dịch vụ, khách hàng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ── Booking list ─────────────────────────────────────────────────── */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center">
          <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
          <p className="text-gray-600">Không có booking nào trong hàng đợi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const statusDisplay = STATUS_DISPLAY[booking.status] ?? {
              label: booking.status,
              color: "bg-gray-100 text-gray-700",
            };

            return (
              <div
                key={booking.id}
                className="bg-white p-4 rounded-lg border hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  {/* ── Info ─────────────────────────────────────────────── */}
                  <div className="flex-1 min-w-0">

                    {/* Title row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900">
                        {booking.services.join(", ")}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}
                      >
                        {statusDisplay.label}
                      </span>
                      {booking.isWalkIn && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          Walk-In
                        </span>
                      )}
                      {booking.queueTicket && (
                        <span className="text-xs text-gray-400 font-mono">
                          #{booking.queueTicket}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="space-y-0.5 text-sm text-gray-600">
                      <p>
                        Khách:{" "}
                        <span className="font-medium">
                          {getCustomerName(booking.customerId)}
                        </span>
                      </p>
                      <p>
                        Xe:{" "}
                        <span className="font-mono font-semibold text-gray-800">
                          {booking.plateNumber}
                        </span>
                        {booking.vehicleType && (
                          <span className="ml-2 text-gray-400 text-xs">
                            ({booking.vehicleType})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {booking.id} · {booking.startTime}–{booking.endTime}
                      </p>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-2 space-y-1">
                      {booking.checkInTime && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle2 size={12} />
                          Check-In:{" "}
                          {new Date(booking.checkInTime).toLocaleTimeString("vi-VN")}
                        </div>
                      )}
                      {booking.checkOutTime && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded ml-1">
                          <CheckCircle2 size={12} />
                          Check-Out:{" "}
                          {new Date(booking.checkOutTime).toLocaleTimeString("vi-VN")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Actions ──────────────────────────────────────────── */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {canCheckIn(booking.status) && (
                      <button
                        onClick={() => handleCheckIn(booking)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Check-In
                      </button>
                    )}
                    {canCheckOut(booking.status) && (
                      <button
                        onClick={() => handleCheckOut(booking)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        Check-Out
                      </button>
                    )}
                    {booking.status === "COMPLETED" && (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium"
                      >
                        Hoàn Thành
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {selectedBooking && (
        <>
          {/* Check-In modal: on submit → updateBooking in context */}
          <StaffCheckInModal
            isOpen={isCheckInModalOpen}
            onClose={() => {
              setIsCheckInModalOpen(false);
              setSelectedBooking(null);
            }}
            onSubmit={handleCheckInSubmit}
            requestId={selectedBooking.id}
            requestTitle={`${selectedBooking.services.join(", ")} — ${selectedBooking.plateNumber}`}
          />

          {/* Check-Out modal: passes checkin photos for reference */}
          <StaffCheckOutModal
            isOpen={isCheckOutModalOpen}
            onClose={() => {
              setIsCheckOutModalOpen(false);
              setSelectedBooking(null);
            }}
            onSubmit={handleCheckOutSubmit}
            requestId={selectedBooking.id}
            requestTitle={`${selectedBooking.services.join(", ")} — ${selectedBooking.plateNumber}`}
            checkinPhotos={selectedBooking.checkinPhotos}
          />
        </>
      )}

      {/* Walk-In modal: calls addBooking() internally → no parent state needed */}
      <StaffWalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
      />
    </div>
  );
}
