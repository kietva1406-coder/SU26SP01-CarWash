'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Booking, TimeSlot, RefundVoucher, BookingStatus } from '@/lib/types';
import { MOCK_BOOKINGS, MOCK_TIME_SLOTS, MOCK_SERVICES } from '@/lib/mock-data';

interface BookingContextType {
  bookings: Booking[];
  slots: TimeSlot[];
  refundVouchers: RefundVoucher[];
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  cancelBooking: (bookingId: string) => void;
  updateSlot: (slotId: string, updates: Partial<TimeSlot>) => void;
  getBookingsByCustomer: (customerId: string) => Booking[];
  getBookingById: (bookingId: string) => Booking | undefined;
  getRefundVouchersByCustomer: (customerId: string) => RefundVoucher[];
  useRefundVoucher: (voucherId: string, bookingId: string) => void;
  // Helper selectors — avoid duplicating filter logic in every component
  getActiveBookings: () => Booking[];
  getCompletedBookings: () => Booking[];
  getBookingsByStatus: (status: BookingStatus) => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [slots, setSlots] = useState<TimeSlot[]>(MOCK_TIME_SLOTS);
  const [refundVouchers, setRefundVouchers] = useState<RefundVoucher[]>([]);

  // Add a new booking
  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
    
    // Update slot current bookings count
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === booking.slotId
          ? { ...slot, currentBookings: slot.currentBookings + 1 }
          : slot
      )
    );
  }, []);

  // Update an existing booking
  const updateBooking = useCallback((bookingId: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
          : booking
      )
    );
  }, []);

  // Cancel a booking and create refund voucher
  const cancelBooking = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id === bookingId) {
          // Update slot count when cancelling
          setSlots((prevSlots) =>
            prevSlots.map((slot) =>
              slot.id === booking.slotId
                ? { ...slot, currentBookings: Math.max(0, slot.currentBookings - 1) }
                : slot
            )
          );

          // Calculate refund amount based on services
          const bookingServices = MOCK_SERVICES.filter(s => booking.serviceIds.includes(s.id));
          const totalAmount = bookingServices.reduce((sum, s) => sum + s.price, 0);

          // Create refund voucher if customer is not WALK-IN
          if (booking.customerId !== 'WALK-IN' && totalAmount > 0) {
            const now = new Date();
            const validUntil = new Date(now);
            validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days

            const refundVoucher: RefundVoucher = {
              id: `RV${Date.now()}`,
              customerId: booking.customerId,
              bookingId: booking.id,
              code: `REFUND-${booking.id}`,
              amount: totalAmount,
              originalAmount: totalAmount,
              description: `Hoàn tiền cho booking ${booking.id} - ${booking.services.join(', ')}`,
              validFrom: now.toISOString(),
              validUntil: validUntil.toISOString(),
              isUsed: false,
              createdAt: now.toISOString(),
            };

            setRefundVouchers((prev) => [...prev, refundVoucher]);
          }

          return {
            ...booking,
            status: 'CANCELLED' as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return booking;
      })
    );
  }, []);

  // Update a slot
  const updateSlot = useCallback((slotId: string, updates: Partial<TimeSlot>) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, ...updates } : slot
      )
    );
  }, []);

  // Get bookings by customer ID
  const getBookingsByCustomer = useCallback(
    (customerId: string) => {
      return bookings.filter((booking) => booking.customerId === customerId);
    },
    [bookings]
  );

  // Get booking by ID
  const getBookingById = useCallback(
    (bookingId: string) => {
      return bookings.find((booking) => booking.id === bookingId);
    },
    [bookings]
  );

  // Get refund vouchers by customer ID
  const getRefundVouchersByCustomer = useCallback(
    (customerId: string) => {
      return refundVouchers.filter((v) => v.customerId === customerId && !v.isUsed);
    },
    [refundVouchers]
  );

  // Get all active bookings (awaiting or in service — not terminal states)
  const getActiveBookings = useCallback(() => {
    return bookings.filter(
      (b) =>
        b.status === 'PENDING_CHECKIN' ||
        b.status === 'CONFIRMED' ||
        b.status === 'CHECKED_IN' ||
        b.status === 'IN_PROGRESS'
    );
  }, [bookings]);

  // Get all completed bookings — used by Manager History (BR-A28)
  const getCompletedBookings = useCallback(() => {
    return bookings.filter((b) => b.status === 'COMPLETED');
  }, [bookings]);

  // Get bookings filtered by any specific status
  const getBookingsByStatus = useCallback(
    (status: BookingStatus) => {
      return bookings.filter((b) => b.status === status);
    },
    [bookings]
  );

  // Use a refund voucher
  const useRefundVoucher = useCallback((voucherId: string, bookingId: string) => {
    setRefundVouchers((prev) =>
      prev.map((voucher) =>
        voucher.id === voucherId
          ? {
              ...voucher,
              isUsed: true,
              usedAt: new Date().toISOString(),
              usedInBookingId: bookingId,
            }
          : voucher
      )
    );
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        slots,
        refundVouchers,
        addBooking,
        updateBooking,
        cancelBooking,
        updateSlot,
        getBookingsByCustomer,
        getBookingById,
        getRefundVouchersByCustomer,
        useRefundVoucher,
        getActiveBookings,
        getCompletedBookings,
        getBookingsByStatus,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
