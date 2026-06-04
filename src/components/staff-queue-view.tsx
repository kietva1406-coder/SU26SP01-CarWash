'use client';

import { useState } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import StaffCheckInModal from './staff-checkin-modal';
import StaffCheckOutModal from './staff-checkout-modal';

interface CustomerRequest {
  id: string;
  customerId: string;
  customerName: string;
  requestType: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'CHECKING_OUT' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  assignedStaff: string[];
  checkinPhotos?: string[];
  checkinAt?: string;
  checkinStaff?: string;
  checkinNotes?: string;
  checkoutPhotos?: string[];
  checkoutAt?: string;
  checkoutStaff?: string;
  checkoutNotes?: string;
  completedAt?: string;
}

// Mock requests assigned to staff
const MOCK_ASSIGNED_REQUESTS: CustomerRequest[] = [
  {
    id: 'REQ001',
    customerId: 'cus1',
    customerName: 'Nguyễn Văn A',
    requestType: 'SERVICE_REQUEST',
    title: 'Rửa xe chuyên biệt',
    description: 'Cần rửa xe ngoài giờ hành chính',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignedStaff: ['staff2'],
    checkinPhotos: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwwDAwwEBAMEBQwEAwwEBQwEBQwECAwICAgICAwEBAwICAwICAwICAwICAwICAwH/2wBDAQICAgMDAwwDAwwICAgwCAwICAgICAwIDAwMDAwIDAwMDAwIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ybnJ2eoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=='],
    checkinAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    checkinStaff: 'staff2',
    checkinNotes: 'Xe bẩn, cần rửa kỹ',
  },
  {
    id: 'REQ002',
    customerId: 'cus2',
    customerName: 'Trần Thị B',
    requestType: 'COMPLAINT',
    title: 'Khiếu nại rửa xe',
    description: 'Xe vừa rửa xong nhưng vẫn còn bụi',
    status: 'ASSIGNED',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedStaff: ['staff2'],
  },
  {
    id: 'REQ003',
    customerId: 'cus3',
    customerName: 'Lê Văn C',
    requestType: 'SPECIAL_REQUEST',
    title: 'Rửa nội thất',
    description: 'Làm sạch nội thất xe',
    status: 'COMPLETED',
    priority: 'LOW',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignedStaff: ['staff2'],
    checkinPhotos: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwwDAwwEBAMEBQwEAwwEBQwEBQwECAwICAgICAwEBAwICAwICAwICAwICAwICAwH/2wBDAQICAgMDAwwDAwwICAgwCAwICAgICAwIDAwMDAwIDAwMDAwIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ybnJ2eoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=='],
    checkinAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    checkinStaff: 'staff2',
    checkoutPhotos: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwwDAwwEBAMEBQwEAwwEBQwEBQwECAwICAgICAwEBAwICAwICAwICAwICAwICAwH/2wBDAQICAgMDAwwDAwwICAgwCAwICAgICAwIDAwMDAwIDAwMDAwIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ybnJ2eoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=='],
    checkoutAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    checkoutStaff: 'staff2',
    checkoutNotes: 'Hoàn thành dịch vụ',
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  CHECKING_OUT: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: 'Chờ Check-In',
  IN_PROGRESS: 'Đang Thực Hiện',
  CHECKING_OUT: 'Đang Hoàn Thành',
  COMPLETED: 'Hoàn Thành',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
};

export default function StaffQueueView() {
  const [requests, setRequests] = useState<CustomerRequest[]>(MOCK_ASSIGNED_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);

  // Count by status
  const inProgressCount = requests.filter((r) => r.status === 'IN_PROGRESS').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;
  const assignedCount = requests.filter((r) => r.status === 'ASSIGNED').length;

  // Filter requests
  const filteredRequests = requests.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckIn = (request: CustomerRequest) => {
    setSelectedRequest(request);
    setIsCheckInModalOpen(true);
  };

  const handleCheckInSubmit = (photos: string[], notes: string) => {
    if (!selectedRequest) return;
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? {
            ...r,
            status: 'IN_PROGRESS' as const,
            checkinPhotos: photos,
            checkinAt: new Date().toISOString(),
            checkinStaff: 'staff2',
            checkinNotes: notes,
          }
        : r
    );
    setRequests(updated);
    setIsCheckInModalOpen(false);
  };

  const handleCheckOut = (request: CustomerRequest) => {
    setSelectedRequest(request);
    setIsCheckOutModalOpen(true);
  };

  const handleCheckOutSubmit = (photos: string[], notes: string) => {
    if (!selectedRequest) return;
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? {
            ...r,
            status: 'COMPLETED' as const,
            checkoutPhotos: photos,
            checkoutAt: new Date().toISOString(),
            checkoutStaff: 'staff2',
            checkoutNotes: notes,
            completedAt: new Date().toISOString(),
          }
        : r
    );
    setRequests(updated);
    setIsCheckOutModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Hàng Đợi Công Việc</h1>
          <p className="text-gray-600">Danh sách các công việc được phân chia cho bạn</p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center">
          <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
          <p className="text-gray-600">Không có công việc nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white p-4 rounded-lg border hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{request.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}>
                      {STATUS_LABELS[request.status]}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[request.priority]}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Khách: {request.customerName}</p>
                  <p className="text-gray-600 text-sm">{request.description}</p>

                  {/* Check-in/Check-out Info */}
                  <div className="mt-3 space-y-2">
                    {request.checkinAt && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                        <CheckCircle2 size={16} />
                        <span>Check-In: {new Date(request.checkinAt).toLocaleTimeString('vi-VN')}</span>
                      </div>
                    )}
                    {request.checkoutAt && (
                      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded">
                        <CheckCircle2 size={16} />
                        <span>Check-Out: {new Date(request.checkoutAt).toLocaleTimeString('vi-VN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {request.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleCheckIn(request)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Check-In
                    </button>
                  )}
                  {request.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleCheckOut(request)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      Check-Out
                    </button>
                  )}
                  {request.status === 'COMPLETED' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-sm font-medium"
                    >
                      Hoàn Thành
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedRequest && (
        <>
          <StaffCheckInModal
            isOpen={isCheckInModalOpen}
            onClose={() => setIsCheckInModalOpen(false)}
            onSubmit={handleCheckInSubmit}
            requestId={selectedRequest.id}
            requestTitle={selectedRequest.title}
          />
          <StaffCheckOutModal
            isOpen={isCheckOutModalOpen}
            onClose={() => setIsCheckOutModalOpen(false)}
            onSubmit={handleCheckOutSubmit}
            requestId={selectedRequest.id}
            requestTitle={selectedRequest.title}
            checkinPhotos={selectedRequest.checkinPhotos}
          />
        </>
      )}
    </div>
  );
}
