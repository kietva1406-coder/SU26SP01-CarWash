'use client';

import { useState } from 'react';
import { Plus, Trash2, Star, AlertCircle, X, Check, Car } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_CUSTOMER_VEHICLES, VEHICLE_TYPES } from '@/lib/mock-data';
import { CustomerVehicle, VehicleType, ValidationError } from '@/lib/types';

export default function CustomerVehicleManagementView() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>(
    MOCK_CUSTOMER_VEHICLES.filter(v => v.customerId === user?.id)
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    plateNumber: '',
    vehicleType: 'sedan' as VehicleType,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  if (!user) return null;

  const openAddModal = () => {
    setFormData({ plateNumber: '', vehicleType: 'sedan' });
    setValidationErrors([]);
    setShowAddModal(true);
  };

  const setAsPrimary = (vehicleId: string) => {
    setVehicles(vehicles.map(v => ({
      ...v,
      isPrimary: v.id === vehicleId
    })));
  };

  const deleteVehicle = (vehicleId: string) => {
    if (vehicles.length === 1) {
      setValidationErrors([{
        rule: 'REQUIRED',
        message: 'Bạn phải có ít nhất 1 biển số xe đăng ký'
      }]);
      return;
    }

    if (confirm('Bạn có chắc muốn xóa biển số xe này?')) {
      const vehicleToDelete = vehicles.find(v => v.id === vehicleId);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      
      // If deleting primary, set first remaining as primary
      if (vehicleToDelete?.isPrimary) {
        setVehicles(prev => {
          if (prev.length > 0) {
            return [{
              ...prev[0],
              isPrimary: true
            }, ...prev.slice(1)];
          }
          return prev;
        });
      }
    }
  };

  const handleSubmit = () => {
    const errors: ValidationError[] = [];

    // Validate plate format
    const plateFormat = /^[0-9]{2}[A-Z]-\d{4,5}$|^[0-9]{2}[A-Z]-\d{4,5}[A-Z]{1,2}$/;
    if (!plateFormat.test(formData.plateNumber.toUpperCase())) {
      errors.push({
        rule: 'INVALID',
        message: 'Định dạng biển số xe không hợp lệ (VD: 29A-12345)',
        field: 'plateNumber'
      });
    }

    // Check if plate already registered
    if (vehicles.some(v => v.plateNumber.toUpperCase() === formData.plateNumber.toUpperCase())) {
      errors.push({
        rule: 'DUPLICATE',
        message: 'Biển số xe này đã được đăng ký',
        field: 'plateNumber'
      });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const newVehicle: CustomerVehicle = {
      id: `VH${String(Date.now()).slice(-6)}`,
      customerId: user.id,
      plateNumber: formData.plateNumber.toUpperCase(),
      vehicleType: formData.vehicleType,
      isPrimary: vehicles.length === 0, // First vehicle is primary
      createdAt: new Date().toISOString(),
    };

    setVehicles([...vehicles, newVehicle]);
    setShowAddModal(false);
    setValidationErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Car className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Quản lý Biển Số Xe</h3>
            <p className="text-sm text-blue-700">
              Đăng ký các biển số xe của bạn để sử dụng trong các lần đặt lịch. Bạn có thể chọn một biển số làm mặc định.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Biển Số Xe Đã Đăng Ký</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm Biển Số Xe
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-700 mb-2">Lỗi</h4>
              <ul className="space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i} className="text-sm text-red-600">{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles List */}
      <div className="space-y-3">
        {vehicles.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg text-slate-500">
            <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có biển số xe nào được đăng ký</p>
            <p className="text-xs text-slate-400 mt-1">Thêm biển số xe đầu tiên để bắt đầu đặt lịch</p>
          </div>
        ) : (
          vehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className={`border rounded-lg p-4 transition-all ${
                vehicle.isPrimary
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-indigo-600" />
                    <span className="font-mono font-bold text-lg text-slate-900">
                      {vehicle.plateNumber}
                    </span>
                    {vehicle.isPrimary && (
                      <span className="flex items-center gap-1 ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                        <Star className="w-3 h-3" />
                        Mặc Định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Loại xe: <span className="font-semibold">
                      {VEHICLE_TYPES.find(vt => vt.value === vehicle.vehicleType)?.label}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Đăng ký ngày: {new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {!vehicle.isPrimary && (
                    <button
                      onClick={() => setAsPrimary(vehicle.id)}
                      className="flex items-center gap-1 px-3 py-2 text-amber-600 bg-amber-100 hover:bg-amber-200 rounded transition-colors text-sm font-medium"
                      title="Đặt làm mặc định"
                    >
                      <Star className="w-4 h-4" />
                      Đặt Làm Mặc Định
                    </button>
                  )}
                  <button
                    onClick={() => deleteVehicle(vehicle.id)}
                    disabled={vehicles.length === 1}
                    className="flex items-center gap-1 px-3 py-2 text-red-600 bg-red-100 hover:bg-red-200 rounded transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    title={vehicles.length === 1 ? 'Không thể xóa biển số xe duy nhất' : 'Xóa'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Thêm Biển Số Xe</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setValidationErrors([]);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Validation Errors in Modal */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <ul className="space-y-1">
                    {validationErrors.map((error, i) => (
                      <li key={i} className="text-sm text-red-600">{error.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Plate Number */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Biển Số Xe
                </label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() });
                    setValidationErrors([]);
                  }}
                  placeholder="VD: 29A-12345"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono uppercase"
                />
                <p className="text-xs text-slate-500 mt-1">Định dạng: XX[A-Z]-XXXXX (VD: 29A-12345)</p>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Loại Xe
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as VehicleType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {VEHICLE_TYPES.map(vt => (
                    <option key={vt.value} value={vt.value}>{vt.label}</option>
                  ))}
                </select>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  {vehicles.length === 0
                    ? '✓ Biển số xe này sẽ được đặt làm mặc định'
                    : '✓ Bạn sẽ có thể đặt làm mặc định sau khi tạo'}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setValidationErrors([]);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Thêm Xe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
