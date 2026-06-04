'use client';

import { X } from 'lucide-react';
import QRCode from '@/components/qr-code';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plateNumber: string;
  service: string;
  date: string;
  time: string;
  customerId?: string; // BR-A54: Unique customer ID
}

export default function BookingModal({
  isOpen,
  onClose,
  plateNumber,
  service,
  date,
  time,
  customerId,
}: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Message */}
        <div className="text-center mb-6">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Đặt lịch thành công!</h2>
          <p className="text-slate-600">Vui lòng quét mã QR khi tới cơ sở</p>
        </div>

        {/* QR Code */}
        <div className="bg-slate-100 p-4 rounded-lg flex justify-center mb-6">
          <QRCode />
        </div>

        {/* Booking Details */}
        <div className="bg-slate-50 rounded-lg p-4 space-y-3 mb-6">
          {customerId && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Mã khách hàng:</span>
              <span className="font-semibold text-indigo-600">{customerId}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Biển số xe:</span>
            <span className="font-semibold text-slate-900">{plateNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Dịch vụ:</span>
            <span className="font-semibold text-slate-900">{service}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Ngày:</span>
            <span className="font-semibold text-slate-900">{date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Giờ:</span>
            <span className="font-semibold text-slate-900">{time}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
