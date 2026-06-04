'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  Filter,
  Eye,
  EyeOff,
  Ticket,
  Bell,
  Zap,
  Tag,
  Gift,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Event, EventType } from '@/lib/types';
import { MOCK_EVENTS, MOCK_VOUCHERS } from '@/lib/mock-data';
import { getEventStatus, getEventTypeInfo, formatEventDateRange } from '@/lib/events';

type EventFormData = {
  title: string;
  description: string;
  shortDescription: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  linkedVoucherId: string;
  priority: number;
  isVisible: boolean;
};

const INITIAL_FORM_DATA: EventFormData = {
  title: '',
  description: '',
  shortDescription: '',
  eventType: 'PROMOTION',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  linkedVoucherId: '',
  priority: 5,
  isVisible: true,
};

const EVENT_TYPES: { value: EventType; label: string; icon: React.ElementType }[] = [
  { value: 'PROMOTION', label: 'Khuyến mãi', icon: Tag },
  { value: 'FLASH_SALE', label: 'Flash Sale', icon: Zap },
  { value: 'HOLIDAY', label: 'Lễ hội', icon: Gift },
  { value: 'NEWS', label: 'Tin tức', icon: Bell },
  { value: 'ANNOUNCEMENT', label: 'Thông báo', icon: Megaphone },
];

export function AdminEventsManagement() {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || e.eventType === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => b.priority - a.priority);
  }, [events, searchTerm, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open create modal
  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors([]);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription || '',
      eventType: event.eventType,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      linkedVoucherId: event.linkedVoucherId || '',
      priority: event.priority,
      isVisible: event.isVisible,
    });
    setFormErrors([]);
    setShowModal(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Tiêu đề không được để trống');
    }

    if (!formData.description.trim()) {
      errors.push('Mô tả không được để trống');
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.push('Ngày kết thúc phải sau ngày bắt đầu');
    }

    if (formData.priority < 1 || formData.priority > 10) {
      errors.push('Độ ưu tiên phải từ 1-10');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  // Handle form submit
  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();
    const linkedVoucher = MOCK_VOUCHERS.find(v => v.id === formData.linkedVoucherId);

    if (editingEvent) {
      // Update existing event
      setEvents(prev => prev.map(e =>
        e.id === editingEvent.id
          ? {
              ...e,
              title: formData.title,
              description: formData.description,
              shortDescription: formData.shortDescription || undefined,
              eventType: formData.eventType,
              startDate: new Date(formData.startDate).toISOString(),
              endDate: new Date(formData.endDate + 'T23:59:59').toISOString(),
              linkedVoucherId: formData.linkedVoucherId || undefined,
              linkedVoucherCode: linkedVoucher?.code,
              priority: formData.priority,
              isVisible: formData.isVisible,
              updatedAt: now,
            }
          : e
      ));
    } else {
      // Create new event
      const newEvent: Event = {
        id: `EVT${Date.now()}`,
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        eventType: formData.eventType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59').toISOString(),
        linkedVoucherId: formData.linkedVoucherId || undefined,
        linkedVoucherCode: linkedVoucher?.code,
        priority: formData.priority,
        isVisible: formData.isVisible,
        viewCount: 0,
        createdBy: 'USR004',
        createdAt: now,
        updatedAt: now,
      };
      setEvents(prev => [newEvent, ...prev]);
    }

    setShowModal(false);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setShowDeleteConfirm(null);
  };

  // Toggle event visibility
  const toggleVisibility = (event: Event) => {
    setEvents(prev => prev.map(e =>
      e.id === event.id ? { ...e, isVisible: !e.isVisible, updatedAt: new Date().toISOString() } : e
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Sự Kiện</h2>
          <p className="text-slate-500 mt-1">Tạo và quản lý tin tức, khuyến mãi và sự kiện</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo Sự Kiện
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tiêu đề..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EventType | 'ALL')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả loại</option>
            {EVENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {EVENT_TYPES.map(type => {
          const count = events.filter(e => e.eventType === type.value).length;
          const Icon = type.icon;
          return (
            <div key={type.value} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">{type.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedEvents.map(event => {
          const status = getEventStatus(event);
          const typeInfo = getEventTypeInfo(event.eventType);
          const TypeIcon = EVENT_TYPES.find(t => t.value === event.eventType)?.icon || Tag;
          const linkedVoucher = MOCK_VOUCHERS.find(v => v.id === event.linkedVoucherId);

          return (
            <div
              key={event.id}
              className={`bg-white rounded-lg border overflow-hidden ${
                event.isVisible ? 'border-slate-200' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                      <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-slate-400">#{event.priority}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleVisibility(event)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        event.isVisible
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={event.isVisible ? 'Ẩn' : 'Hiện'}
                    >
                      {event.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(event)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(event.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                  {event.shortDescription || event.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatEventDateRange(event)}
                  </span>
                  <div className="flex items-center gap-2">
                    {linkedVoucher && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Ticket className="w-3 h-3" />
                        {linkedVoucher.code}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {event.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {paginatedEvents.length === 0 && (
        <div className="py-12 text-center text-slate-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>Không tìm thấy sự kiện nào</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredEvents.length)} / {filteredEvents.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm ${
                  page === currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingEvent ? 'Chỉnh Sửa Sự Kiện' : 'Tạo Sự Kiện Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Errors */}
              {formErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Vui lòng sửa các lỗi sau:
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {formErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Title & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: Flash Sale cuối tuần"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại sự kiện
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Hiển thị trên danh sách"
                  maxLength={100}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nội dung chi tiết của sự kiện..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Voucher & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Voucher đi kèm
                  </label>
                  <select
                    value={formData.linkedVoucherId}
                    onChange={(e) => setFormData({ ...formData, linkedVoucherId: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Không có --</option>
                    {MOCK_VOUCHERS.filter(v => v.isActive).map(voucher => (
                      <option key={voucher.id} value={voucher.id}>
                        {voucher.code} - {voucher.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Độ ưu tiên (1-10)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    min={1}
                    max={10}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Hiển thị cho khách hàng</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingEvent ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Xác nhận xóa</h3>
              <p className="text-slate-500 mb-6">
                Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEventsManagement;
