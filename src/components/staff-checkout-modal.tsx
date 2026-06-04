'use client';

import { useState, useRef } from 'react';
import { X, Upload, Camera, CheckCircle } from 'lucide-react';

interface StaffCheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (photos: string[], notes: string) => void;
  requestId: string;
  requestTitle: string;
  checkinPhotos?: string[];
}

export default function StaffCheckOutModal({
  isOpen,
  onClose,
  onSubmit,
  requestId,
  requestTitle,
  checkinPhotos = [],
}: StaffCheckOutModalProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotos((prev) => [...prev, event.target?.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      alert('Vui lòng tải lên ít nhất 1 ảnh check-out');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onSubmit(photos, notes);
      setPhotos([]);
      setNotes('');
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle size={28} className="text-green-600" />
              Check-Out
            </h2>
            <p className="text-gray-600 text-sm">{requestTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Request Info */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Mã yêu cầu: {requestId}</p>
            <p className="font-semibold text-gray-900">{requestTitle}</p>
          </div>

          {/* Check-in Photos Reference */}
          {checkinPhotos.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Ảnh Check-In để tham khảo
              </p>
              <div className="grid grid-cols-3 gap-2">
                {checkinPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="bg-white rounded overflow-hidden border border-blue-200"
                  >
                    <img
                      src={photo}
                      alt={`checkin-ref-${index}`}
                      className="w-full h-16 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              📸 Tải ảnh Check-Out (Hoàn thành)
            </label>
            <div className="space-y-3">
              {/* Upload Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 transition"
                >
                  <Upload size={20} />
                  <span>Chọn ảnh từ máy</span>
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 transition"
                >
                  <Camera size={20} />
                  <span>Chụp ảnh</span>
                </button>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Photos Preview */}
              {photos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Ảnh check-out đã tải ({photos.length})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative bg-gray-100 rounded-lg overflow-hidden group"
                      >
                        <img
                          src={photo}
                          alt={`checkout-${index}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Ghi chú hoàn thành (Tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả về công việc đã hoàn thành..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
            />
          </div>

          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-sm text-green-800">
            <p className="font-semibold mb-1">Lưu ý check-out:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tải lên ảnh chứng minh xe đã được hoàn thành dịch vụ</li>
              <li>Ảnh phải rõ ràng và bao phủ toàn bộ xe sau khi rửa</li>
              <li>So sánh với ảnh check-in để chứng minh sự cải thiện</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || photos.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Hoàn Thành Công Việc'}
          </button>
        </div>
      </div>
    </div>
  );
}
