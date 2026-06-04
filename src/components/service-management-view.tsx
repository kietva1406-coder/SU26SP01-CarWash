'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Lock, AlertCircle, X, Clock, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_SERVICES } from '@/lib/mock-data';
import { Service, ValidationError } from '@/lib/types';
import { validateService } from '@/lib/booking-validation';
import { canManageServices } from '@/lib/permissions';

export default function ServiceManagementView() {
  const { user, permissions } = useAuth();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  if (!user || !permissions) return null;

  // BR-A23: Chỉ admin/manager tạo service package
  const canManage = canManageServices(user.role);

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Lock className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Không có quyền truy cập</h2>
        <p className="text-slate-500 mt-2">
          BR-A23: Chỉ Admin và Manager mới được quản lý dịch vụ
        </p>
      </div>
    );
  }

  const toggleServiceActive = (serviceId: string) => {
    setServices(
      services.map((s) =>
        s.id === serviceId ? { ...s, active: !s.active } : s
      )
    );
  };

  const deleteService = (serviceId: string) => {
    if (confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      setServices(services.filter((s) => s.id !== serviceId));
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', description: '', price: 0, duration: 30 });
    setValidationErrors([]);
    setShowAddModal(true);
    setEditingService(null);
  };

  const openEditModal = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
    });
    setValidationErrors([]);
    setEditingService(service);
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    const newService: Partial<Service> = {
      id: editingService?.id || `SRV${String(services.length + 1).padStart(3, '0')}`,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      priceDisplay: `${formData.price.toLocaleString('vi-VN')}đ`,
      duration: formData.duration,
      active: true,
    };

    // Validate service (BR-A21, BR-A22, BR-A55)
    const existingForValidation = editingService 
      ? services.filter(s => s.id !== editingService.id)
      : services;
    
    const validation = validateService(newService, existingForValidation);
    
    // Additional validations
    const errors: ValidationError[] = [...validation.errors];
    
    if (!formData.name.trim()) {
      errors.push({ rule: 'REQUIRED', message: 'Tên dịch vụ là bắt buộc', field: 'name' });
    }
    
    if (formData.price <= 0) {
      errors.push({ rule: 'REQUIRED', message: 'Giá phải lớn hơn 0', field: 'price' });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (editingService) {
      // Update existing
      setServices(services.map(s => 
        s.id === editingService.id 
          ? { ...s, ...newService } as Service
          : s
      ));
    } else {
      // Add new
      setServices([...services, newService as Service]);
    }

    setShowAddModal(false);
    setEditingService(null);
    setValidationErrors([]);
  };

  // Calculate minimum service duration for BR-A56 display
  const minServiceDuration = Math.min(...services.map(s => s.duration));

  return (
    <div className="space-y-6">
      {/* Permission Info (BR-A23) */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">
            BR-A23: Bạn có quyền quản lý dịch vụ vì bạn là {user.role === 'admin' ? 'Admin' : 'Manager'}
          </span>
        </div>
      </div>

      {/* Business Rules Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-semibold text-slate-700 mb-2">Quy tắc Service Package:</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            BR-A21: Service package phải có estimated duration
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            BR-A22: Mỗi package có mã định danh riêng
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            BR-A55: Service duration không được âm
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            BR-A56: Slot duration tối thiểu hiện tại: {minServiceDuration} phút
          </li>
        </ul>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Dịch Vụ</h2>
          <p className="text-slate-500 mt-1">Thêm, sửa, xóa các dịch vụ rửa xe</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm Dịch Vụ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Tổng dịch vụ</div>
          <div className="text-2xl font-bold text-indigo-600">{services.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-600">
            {services.filter((s) => s.active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Đã tạm dừng</div>
          <div className="text-2xl font-bold text-red-600">
            {services.filter((s) => !s.active).length}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                ID (BR-A22)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Tên Dịch Vụ
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Mô Tả
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Duration (BR-A21)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono font-medium text-indigo-600">
                  {service.id}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {service.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {service.description}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                  {service.priceDisplay}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {service.duration} phút
                  </div>
                  {service.duration < 0 && (
                    <span className="text-xs text-red-500">BR-A55 vi phạm!</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleServiceActive(service.id)}
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                      service.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {service.active ? 'Hoạt động' : 'Tạm dừng'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingService ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <ul className="text-sm text-red-600 space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i}>
                      <span className="font-medium">{error.rule}:</span> {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Tên Dịch Vụ
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: Rửa xe cao cấp"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết dịch vụ"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  min={0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Duration (BR-A21, BR-A55) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Thời Gian (phút) - BR-A21, BR-A55
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min={1}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <p className="text-xs text-slate-500 mt-1">
                  BR-A55: Duration phải {">"} 0. BR-A21: Bắt buộc có duration.
                </p>
              </div>

              {/* Validation Rules Info */}
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                <strong>Quy tắc kiểm tra:</strong>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  <li>BR-A21: Phải có estimated duration</li>
                  <li>BR-A22: ID duy nhất (tự động)</li>
                  <li>BR-A55: Duration không được âm</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                {editingService ? 'Cập Nhật' : 'Thêm Mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
