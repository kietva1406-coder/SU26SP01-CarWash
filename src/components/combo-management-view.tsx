'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Lock, AlertCircle, X, Check, Tag, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_COMBOS, MOCK_SERVICES } from '@/lib/mock-data';
import { Combo, Service, ValidationError } from '@/lib/types';
import { canManageServices } from '@/lib/permissions';

export default function ComboManagementView() {
  const { user, permissions } = useAuth();
  const [combos, setCombos] = useState<Combo[]>(MOCK_COMBOS);
  const [services] = useState<Service[]>(MOCK_SERVICES);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedServices: [] as string[],
    discount: 0,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  if (!user || !permissions) return null;

  // BR-A23: Chỉ admin/manager tạo combo
  const canManage = canManageServices(user.role);

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Lock className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Không có quyền truy cập</h2>
        <p className="text-slate-500 mt-2">
          BR-A23: Chỉ Admin và Manager mới được quản lý combo dịch vụ
        </p>
      </div>
    );
  }

  const toggleComboActive = (comboId: string) => {
    setCombos(
      combos.map((c) =>
        c.id === comboId ? { ...c, active: !c.active } : c
      )
    );
  };

  const deleteCombo = (comboId: string) => {
    if (confirm('Bạn có chắc muốn xóa combo này?')) {
      setCombos(combos.filter((c) => c.id !== comboId));
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', description: '', selectedServices: [], discount: 0 });
    setValidationErrors([]);
    setShowAddModal(true);
    setEditingCombo(null);
  };

  const openEditModal = (combo: Combo) => {
    setFormData({
      name: combo.name,
      description: combo.description,
      selectedServices: combo.services,
      discount: combo.discount || 0,
    });
    setValidationErrors([]);
    setEditingCombo(combo);
    setShowAddModal(true);
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const calculateComboPrice = () => {
    const selectedSvcs = services.filter(s => formData.selectedServices.includes(s.id));
    const totalPrice = selectedSvcs.reduce((sum, s) => sum + s.price, 0);
    const discount = formData.discount || 0;
    return {
      original: totalPrice,
      discounted: Math.round(totalPrice * (1 - discount / 100)),
      discount
    };
  };

  const calculateComboDuration = () => {
    const selectedSvcs = services.filter(s => formData.selectedServices.includes(s.id));
    return selectedSvcs.reduce((sum, s) => sum + s.duration, 0);
  };

  const handleSubmit = () => {
    const errors: ValidationError[] = [];

    if (!formData.name.trim()) {
      errors.push({ rule: 'REQUIRED', message: 'Tên combo là bắt buộc', field: 'name' });
    }

    if (formData.selectedServices.length === 0) {
      errors.push({ rule: 'REQUIRED', message: 'Chọn ít nhất 1 dịch vụ', field: 'services' });
    }

    if (formData.discount < 0 || formData.discount >= 100) {
      errors.push({ rule: 'INVALID', message: 'Discount phải từ 0 đến 99%', field: 'discount' });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const pricing = calculateComboPrice();
    const newCombo: Partial<Combo> = {
      id: editingCombo?.id || `CMB${String(combos.length + 1).padStart(3, '0')}`,
      name: formData.name,
      description: formData.description,
      services: formData.selectedServices,
      totalPrice: pricing.discounted,
      totalPriceDisplay: `${pricing.discounted.toLocaleString('vi-VN')}đ`,
      totalDuration: calculateComboDuration(),
      discount: formData.discount || 0,
      active: editingCombo?.active || true,
      updatedAt: new Date().toISOString(),
    };

    if (editingCombo) {
      setCombos(combos.map(c => 
        c.id === editingCombo.id 
          ? { ...c, ...newCombo } as Combo
          : c
      ));
    } else {
      setCombos([...combos, { ...newCombo, createdAt: new Date().toISOString() } as Combo]);
    }

    setShowAddModal(false);
    setEditingCombo(null);
    setValidationErrors([]);
  };

  const pricing = calculateComboPrice();

  return (
    <div className="space-y-6">
      {/* Permission Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">
            Bạn có quyền quản lý combo dịch vụ vì bạn là {user.role === 'admin' ? 'Admin' : 'Manager'}
          </span>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Quản lý Combo Dịch Vụ</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Tạo Combo Mới
        </button>
      </div>

      {/* Combos List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {combos.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500">
            Chưa có combo nào. Tạo combo mới để bắt đầu!
          </div>
        ) : (
          combos.map(combo => (
            <div
              key={combo.id}
              className={`border rounded-lg p-4 transition-colors ${
                combo.active
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">{combo.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{combo.description}</p>
                </div>
                {!combo.active && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>

              {/* Services in combo */}
              <div className="mb-3 p-2 bg-white rounded border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-1">Dịch vụ bao gồm:</p>
                <div className="flex flex-wrap gap-1">
                  {combo.services.map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    return service ? (
                      <span key={serviceId} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {service.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex items-center gap-1 text-sm">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-600">{combo.totalPriceDisplay}</div>
                    {combo.discount > 0 && (
                      <div className="text-xs text-red-600">-{combo.discount}%</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-600">{combo.totalDuration} min</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <div className="font-semibold">{combo.id}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleComboActive(combo.id)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    combo.active
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-green-200 text-green-700 hover:bg-green-300'
                  }`}
                >
                  {combo.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
                <button
                  onClick={() => openEditModal(combo)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  <Pencil className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => deleteCombo(combo.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingCombo ? 'Sửa Combo' : 'Tạo Combo Mới'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-700 mb-1">Lỗi</h4>
                      <ul className="space-y-1">
                        {validationErrors.map((error, i) => (
                          <li key={i} className="text-sm text-red-600">{error.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Tên Combo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Combo Toàn Diện"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả combo dịch vụ"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Services Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Chọn Dịch Vụ
                </label>
                <div className="space-y-2">
                  {services.map(service => (
                    <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="text-sm text-slate-700">
                        {service.name} - {service.priceDisplay} ({service.duration} min)
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Giảm Giá (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Math.max(0, Math.min(99, Number(e.target.value))) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Price Preview */}
              {formData.selectedServices.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="text-sm text-indigo-900">
                    <div className="flex justify-between mb-1">
                      <span>Giá gốc:</span>
                      <span className="font-semibold">{pricing.original.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between mb-1 text-red-600">
                        <span>Giảm {pricing.discount}%:</span>
                        <span className="font-semibold">-{Math.round(pricing.original * pricing.discount / 100).toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-indigo-200 pt-1 mt-1 font-bold">
                      <span>Giá bán:</span>
                      <span>{pricing.discounted.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-indigo-700">
                      <span>Tổng thời gian:</span>
                      <span>{calculateComboDuration()} phút</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editingCombo ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
