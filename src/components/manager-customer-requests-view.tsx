'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_USERS } from '@/lib/mock-data';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  X,
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react';

interface CustomerRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  requestType: 'SERVICE_REQUEST' | 'COMPLAINT' | 'SPECIAL_REQUEST' | 'CANCELLATION';
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'CHECKING_OUT' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  assignedStaff: string[]; // Array of staff IDs assigned
  notes?: string;
  // Check-in fields
  checkinPhotos?: string[]; // Array of base64 or URLs
  checkinAt?: string;
  checkinStaff?: string; // Staff ID who checked in
  checkinNotes?: string;
  // Check-out fields
  checkoutPhotos?: string[]; // Array of base64 or URLs
  checkoutAt?: string;
  checkoutStaff?: string; // Staff ID who checked out
  checkoutNotes?: string;
  completedAt?: string;
}

// Mock requests data
const MOCK_REQUESTS: CustomerRequest[] = [
  {
    id: 'REQ001',
    customerId: 'cus1',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'customer1@example.com',
    requestType: 'SERVICE_REQUEST',
    title: 'Yêu cầu dịch vụ chuyên biệt',
    description: 'Cần rửa xe ngoài giờ hành chính, vui lòng liên hệ để sắp xếp',
    status: 'PENDING',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedStaff: [],
  },
  {
    id: 'REQ002',
    customerId: 'cus2',
    customerName: 'Trần Thị B',
    customerEmail: 'customer2@example.com',
    requestType: 'COMPLAINT',
    title: 'Khiếu nại về chất lượng dịch vụ',
    description: 'Xe vừa rửa xong nhưng vẫn còn bụi ở một số chỗ',
    status: 'APPROVED',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'mgr1',
    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedStaff: ['staff1', 'staff2'],
    notes: 'Sẽ rửa lại xe cho khách',
  },
  {
    id: 'REQ003',
    customerId: 'cus3',
    customerName: 'Lê Văn C',
    customerEmail: 'customer3@example.com',
    requestType: 'SPECIAL_REQUEST',
    title: 'Yêu cầu chăm sóc nội thất',
    description: 'Muốn làm sạch nội thất xe, cần thêm dịch vụ này',
    status: 'APPROVED',
    priority: 'LOW',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'mgr1',
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignedStaff: ['staff3'],
  },
  {
    id: 'REQ004',
    customerId: 'cus4',
    customerName: 'Phạm Văn D',
    customerEmail: 'customer4@example.com',
    requestType: 'CANCELLATION',
    title: 'Hủy yêu cầu dịch vụ',
    description: 'Khách hàng muốn hủy booking',
    status: 'REJECTED',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    assignedStaff: [],
  },
  {
    id: 'REQ005',
    customerId: 'cus5',
    customerName: 'Hoàng Thị E',
    customerEmail: 'customer5@example.com',
    requestType: 'SERVICE_REQUEST',
    title: 'Yêu cầu tăng gói dịch vụ',
    description: 'Muốn nâng cấp từ gói cơ bản lên gói premium',
    status: 'PENDING',
    priority: 'LOW',
    createdAt: new Date().toISOString(),
    assignedStaff: [],
  },
  {
    id: 'REQ006',
    customerId: 'cus6',
    customerName: 'Võ Văn F',
    customerEmail: 'customer6@example.com',
    requestType: 'SERVICE_REQUEST',
    title: 'Rửa xe chuyên biệt - Xe 7 chỗ',
    description: 'Rửa toàn bộ xe 7 chỗ với dịch vụ chuyên biệt',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'mgr1',
    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedStaff: ['staff2'],
    notes: 'Hoàn thành dịch vụ rửa xe',
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
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const REQUEST_TYPE_LABELS: Record<string, string> = {
  SERVICE_REQUEST: 'Yêu Cầu Dịch Vụ',
  COMPLAINT: 'Khiếu Nại',
  SPECIAL_REQUEST: 'Yêu Cầu Đặc Biệt',
  CANCELLATION: 'Hủy Yêu Cầu',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung Bình',
  HIGH: 'Cao',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ASSIGNED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  CHECKING_OUT: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ Duyệt',
  APPROVED: 'Đã Duyệt',
  REJECTED: 'Từ Chối',
  ASSIGNED: 'Đã Phân Chia',
  IN_PROGRESS: 'Đang Thực Hiện',
  CHECKING_OUT: 'Đang Hoàn Thành',
  COMPLETED: 'Hoàn Thành',
};

export default function ManagerCustomerRequestsView() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CustomerRequest[]>(MOCK_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CustomerRequest['status']>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  if (!user) return null;

  const availableStaff = MOCK_USERS.filter(u => u.role === 'staff');

  // Filter requests
  let filteredRequests = requests;

  if (statusFilter !== 'ALL') {
    filteredRequests = filteredRequests.filter(r => r.status === statusFilter);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredRequests = filteredRequests.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.customerName.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    );
  }

  // Sort by priority and date
  filteredRequests.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Handle approve request
  const handleApproveRequest = (request: CustomerRequest) => {
    setRequests(requests.map(r =>
      r.id === request.id
        ? { ...r, status: 'APPROVED' as const, approvedBy: user.id, approvedAt: new Date().toISOString() }
        : r
    ));
    setSelectedRequest(null);
  };

  // Handle reject request
  const handleRejectRequest = (request: CustomerRequest) => {
    setRequests(requests.map(r =>
      r.id === request.id
        ? { ...r, status: 'REJECTED' as const }
        : r
    ));
    setSelectedRequest(null);
  };

  // Handle assign staff
  const handleAssignStaff = () => {
    if (!selectedRequest || selectedStaff.length === 0) return;

    setRequests(requests.map(r =>
      r.id === selectedRequest.id
        ? { ...r, assignedStaff: selectedStaff, status: 'ASSIGNED' as const, notes: `Đã phân chia cho ${selectedStaff.length} nhân viên` }
        : r
    ));

    setSelectedRequest(null);
    setSelectedStaff([]);
    setIsAssignModalOpen(false);
  };

  // Toggle staff selection
  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-indigo-600" />
            Danh Sách Yêu Cầu
          </h1>
          <p className="text-slate-600 mt-1">
            Duyệt và phân chia công việc cho nhân viên
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-yellow-700 font-semibold text-2xl">
              {requests.filter(r => r.status === 'PENDING').length}
            </div>
            <div className="text-yellow-600 text-sm">Chờ duyệt</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-green-700 font-semibold text-2xl">
              {requests.filter(r => r.status === 'APPROVED').length}
            </div>
            <div className="text-green-600 text-sm">Đã duyệt</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, tiêu đề hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả yêu cầu</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="ASSIGNED">Đã phân chia</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{request.title}</h3>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[request.priority]}`}>
                        {PRIORITY_LABELS[request.priority]}
                      </span>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status]}`}>
                        {STATUS_LABELS[request.status]}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-3">{request.description}</div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">•</span>
                        <span>{REQUEST_TYPE_LABELS[request.requestType]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-slate-500 mb-1">ID: {request.id}</div>
                    <div className="text-sm font-medium text-slate-900">{request.customerName}</div>
                  </div>
                </div>

                {/* Staff Assignment Display */}
                {request.assignedStaff.length > 0 && (
                  <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-indigo-900">
                        Đã phân chia cho {request.assignedStaff.length} nhân viên
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.assignedStaff.map((staffId) => {
                        const staff = MOCK_USERS.find(u => u.id === staffId);
                        return staff ? (
                          <div key={staffId} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-indigo-200">
                            <div className="w-5 h-5 bg-indigo-200 rounded-full text-xs flex items-center justify-center text-indigo-700 font-bold">
                              {staff.name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-900">{staff.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                  {request.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsAssignModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Duyệt & Phân Chia
                      </button>
                      <button
                        onClick={() => {
                          handleRejectRequest(request);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        <X className="w-4 h-4" />
                        Từ Chối
                      </button>
                    </>
                  )}
                  {request.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setSelectedStaff(request.assignedStaff);
                        setIsAssignModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                    >
                      <Users className="w-4 h-4" />
                      Thay Đổi Phân Chia
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    Chi Tiết
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Không có yêu cầu nào</p>
            <p className="text-slate-400 text-sm mt-1">Các yêu cầu từ khách hàng sẽ hiển thị ở đây</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && !isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chi Tiết Yêu Cầu</h2>
              <button onClick={() => setSelectedRequest(null)} className="text-white/70 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">ID Yêu Cầu</div>
                <div className="font-semibold text-slate-900">{selectedRequest.id}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Tiêu Đề</div>
                <div className="font-semibold text-slate-900">{selectedRequest.title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Mô Tả</div>
                <div className="text-slate-700">{selectedRequest.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Ưu Tiên</div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[selectedRequest.priority]}`}>
                    {PRIORITY_LABELS[selectedRequest.priority]}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Trạng Thái</div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedRequest.status]}`}>
                    {STATUS_LABELS[selectedRequest.status]}
                  </span>
                </div>
              </div>
              <div>
                <button onClick={() => setSelectedRequest(null)} className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {isAssignModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Phân Chia Công Việc</h2>
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedRequest(null);
                  setSelectedStaff([]);
                }}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Yêu Cầu</h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="font-medium text-slate-900">{selectedRequest.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{selectedRequest.description}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Chọn Nhân Viên</h3>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
                    Đã chọn: {selectedStaff.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableStaff.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => toggleStaffSelection(staff.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedStaff.includes(staff.id)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedStaff.includes(staff.id)
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-slate-300'
                        }`}>
                          {selectedStaff.includes(staff.id) && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{staff.name}</div>
                          <div className="text-sm text-slate-600">{staff.email}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setSelectedRequest(null);
                    setSelectedStaff([]);
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAssignStaff}
                  disabled={selectedStaff.length === 0}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Phân Chia Cho {selectedStaff.length} Nhân Viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
