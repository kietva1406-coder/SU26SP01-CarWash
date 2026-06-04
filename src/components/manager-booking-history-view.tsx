'use client';

import { useState } from 'react';
import { History, Search, X, ZoomIn } from 'lucide-react';

interface CompletedRequest {
  id: string;
  customerName: string;
  title: string;
  description: string;
  completedAt: string;
  checkinPhotos?: string[];
  checkinAt?: string;
  checkinStaff?: string;
  checkinNotes?: string;
  checkoutPhotos?: string[];
  checkoutAt?: string;
  checkoutStaff?: string;
  checkoutNotes?: string;
}

// Mock completed requests with photos
const MOCK_COMPLETED_REQUESTS: CompletedRequest[] = [
  {
    id: 'REQ006',
    customerName: 'Võ Văn F',
    title: 'Rửa xe chuyên biệt - Xe 7 chỗ',
    description: 'Rửa toàn bộ xe 7 chỗ với dịch vụ chuyên biệt',
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    checkinPhotos: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwwDAwwEBAMEBQwEAwwEBQwEBQwECAwICAgICAwEBAwICAwICAwICAwICAwICAwH/2wBDAQICAgMDAwwDAwwICAgwCAwICAgICAwIDAwMDAwIDAwMDAwIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ybnJ2eoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=='
    ],
    checkinAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    checkinStaff: 'staff2',
    checkinNotes: 'Xe bẩn, cần rửa kỹ lưỡng',
    checkoutPhotos: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwwDAwwEBAMEBQwEAwwEBQwEBQwECAwICAgICAwEBAwICAwICAwICAwICAwICAwH/2wBDAQICAgMDAwwDAwwICAgwCAwICAgICAwIDAwMDAwIDAwMDAwIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ybnJ2eoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=='
    ],
    checkoutAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    checkoutStaff: 'staff2',
    checkoutNotes: 'Hoàn thành dịch vụ rửa xe toàn bộ',
  },
];

interface ImageGalleryModalProps {
  isOpen: boolean;
  images: string[];
  title: string;
  onClose: () => void;
}

function ImageGalleryModal({ isOpen, images, title, onClose }: ImageGalleryModalProps) {
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

        {/* Main Image */}
        <div className="relative bg-black flex items-center justify-center" style={{ height: '400px' }}>
          <img
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <button
            onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
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
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-16 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManagerBookingHistoryView() {
  const [requests] = useState<CompletedRequest[]>(MOCK_COMPLETED_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CompletedRequest | null>(null);
  const [galleryType, setGalleryType] = useState<'checkin' | 'checkout'>('checkin');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Filter requests
  const filteredRequests = requests.filter(
    (r) =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openGallery = (request: CompletedRequest, type: 'checkin' | 'checkout') => {
    setSelectedRequest(request);
    setGalleryType(type);
    setIsGalleryOpen(true);
  };

  const getStaffName = (staffId?: string) => {
    const staffNames: Record<string, string> = {
      staff1: 'Lê Văn C',
      staff2: 'Trần Thị B',
      staff3: 'Phạm Văn D',
    };
    return staffNames[staffId || ''] || 'Không xác định';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="w-8 h-8 text-indigo-600" />
            Lịch Sử Booking
          </h1>
          <p className="text-gray-600 mt-1">Xem tất cả các đơn hàng đã hoàn thành cùng thông tin nhân viên</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-700 font-semibold text-2xl">{filteredRequests.length}</div>
          <div className="text-green-600 text-sm">Booking hoàn thành</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm booking..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Completed Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center">
            <p className="text-gray-600">Không có booking hoàn thành nào</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-lg border hover:shadow-lg transition">
              {/* Request Info */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{request.title}</h3>
                    <p className="text-gray-600 text-sm">{request.description}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    Hoàn Thành
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Khách hàng: {request.customerName}</p>
                  <p>Mã yêu cầu: {request.id}</p>
                  <p>Hoàn thành: {new Date(request.completedAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              {/* Check-in Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Check-in */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Check-In</h4>
                  <div className="text-sm text-blue-800 space-y-2 mb-3">
                    <p>Nhân viên: {getStaffName(request.checkinStaff)}</p>
                    <p>Thời gian: {request.checkinAt ? new Date(request.checkinAt).toLocaleTimeString('vi-VN') : 'N/A'}</p>
                    {request.checkinNotes && <p className="italic">Ghi chú: {request.checkinNotes}</p>}
                  </div>
                  {request.checkinPhotos && request.checkinPhotos.length > 0 && (
                    <button
                      onClick={() => openGallery(request, 'checkin')}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <ZoomIn size={16} />
                      Xem {request.checkinPhotos.length} ảnh Check-In
                    </button>
                  )}
                  {request.checkinPhotos && request.checkinPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {request.checkinPhotos.slice(0, 3).map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Check-in ${idx + 1}`}
                          className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-75 transition"
                          onClick={() => openGallery(request, 'checkin')}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Check-out */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">Check-Out</h4>
                  <div className="text-sm text-green-800 space-y-2 mb-3">
                    <p>Nhân viên: {getStaffName(request.checkoutStaff)}</p>
                    <p>Thời gian: {request.checkoutAt ? new Date(request.checkoutAt).toLocaleTimeString('vi-VN') : 'N/A'}</p>
                    {request.checkoutNotes && <p className="italic">Ghi chú: {request.checkoutNotes}</p>}
                  </div>
                  {request.checkoutPhotos && request.checkoutPhotos.length > 0 && (
                    <button
                      onClick={() => openGallery(request, 'checkout')}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <ZoomIn size={16} />
                      Xem {request.checkoutPhotos.length} ảnh Check-Out
                    </button>
                  )}
                  {request.checkoutPhotos && request.checkoutPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {request.checkoutPhotos.slice(0, 3).map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Check-out ${idx + 1}`}
                          className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-75 transition"
                          onClick={() => openGallery(request, 'checkout')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Gallery Modal */}
      {selectedRequest && (
        <ImageGalleryModal
          isOpen={isGalleryOpen}
          images={
            galleryType === 'checkin'
              ? selectedRequest.checkinPhotos || []
              : selectedRequest.checkoutPhotos || []
          }
          title={`${galleryType === 'checkin' ? 'Ảnh Check-In' : 'Ảnh Check-Out'} - ${selectedRequest.title}`}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </div>
  );
}
