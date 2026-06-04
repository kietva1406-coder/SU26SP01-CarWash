'use client';

import { useState } from 'react';
import { ToggleLeft, ToggleRight, Lock, AlertCircle, Plus, X, Users, Clock, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_TIME_SLOTS, MOCK_SERVICES } from '@/lib/mock-data';
import { TimeSlot, ValidationError } from '@/lib/types';
import { canEditSlots } from '@/lib/permissions';
import { validateSlot } from '@/lib/booking-validation';

export default function SlotManagementView() {
  const { user, permissions } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>(MOCK_TIME_SLOTS);
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-20');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    time: '18:00',
    maxCapacity: 3,
    duration: 60,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  if (!user || !permissions) return null;

  // BR-A24: Chỉ admin/manager chỉnh sửa slot
  const canEdit = canEditSlots(user.role);

  // Calculate minimum service duration for BR-A56
  const minServiceDuration = Math.min(...MOCK_SERVICES.map(s => s.duration));

  const toggleSlot = (slotId: string) => {
    if (!canEdit) {
      alert('BR-A24: Bạn không có quyền chỉnh sửa slot!');
      return;
    }

    setSlots(
      slots.map((slot) =>
        slot.id === slotId ? { ...slot, locked: !slot.locked } : slot
      )
    );
  };

  const addSlot = () => {
    if (!canEdit) return;

    // Validate slot (BR-A02, BR-A56)
    const validation = validateSlot({
      duration: formData.duration,
      maxCapacity: formData.maxCapacity,
    }, minServiceDuration);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    const newSlot: TimeSlot = {
      id: `TS${String(slots.length + 1).padStart(3, '0')}`,
      time: formData.time,
      locked: false,
      date: selectedDate,
      maxCapacity: formData.maxCapacity, // BR-A02
      currentBookings: 0,
      duration: formData.duration, // BR-A56
    };
    
    setSlots([...slots, newSlot]);
    setShowAddModal(false);
    setValidationErrors([]);
    setFormData({ time: '18:00', maxCapacity: 3, duration: 60 });
  };

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Lock className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Không có quyền truy cập</h2>
        <p className="text-slate-500 mt-2">
          BR-A24: Chỉ Admin và Manager mới được chỉnh sửa slot
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">
            BR-A24: Bạn có quyền chỉnh sửa slot vì bạn là {user.role === 'admin' ? 'Admin' : 'Manager'}
          </span>
        </div>
      </div>

      {/* Business Rules Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="font-semibold text-slate-700 mb-2">Quy tắc Slot:</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            BR-A02: Slot có giới hạn xe tối đa (maxCapacity)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            BR-A03: Không booking khi slot đầy
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            BR-A45: Slot bị khóa không cho booking
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            BR-A56: Duration {">"} 0 và {">="} {minServiceDuration} phút (service min)
          </li>
        </ul>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Slot</h2>
          <p className="text-slate-500 mt-1">Khóa/mở các khung giờ làm việc</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm Slot
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Tổng slot</div>
          <div className="text-2xl font-bold text-indigo-600">{slots.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Đang mở</div>
          <div className="text-2xl font-bold text-green-600">
            {slots.filter((s) => !s.locked).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Đã khóa (BR-A45)</div>
          <div className="text-2xl font-bold text-red-600">
            {slots.filter((s) => s.locked).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-slate-500 text-sm">Đầy (BR-A03)</div>
          <div className="text-2xl font-bold text-amber-600">
            {slots.filter((s) => s.currentBookings >= s.maxCapacity).length}
          </div>
        </div>
      </div>

      {/* Slot Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Giờ
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Duration (BR-A56)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Capacity (BR-A02)
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
            {slots.map((slot) => {
              const isFull = slot.currentBookings >= slot.maxCapacity;
              
              return (
                <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                    {slot.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {slot.time}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {slot.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {slot.duration} phút
                    </div>
                    {slot.duration < minServiceDuration && (
                      <span className="text-xs text-red-500">
                        BR-A56: {"<"} min ({minServiceDuration}p)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className={isFull ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                        {slot.currentBookings}/{slot.maxCapacity}
                      </span>
                      {isFull && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded ml-1">
                          Đầy
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        slot.locked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {slot.locked ? 'Đã khóa (BR-A45)' : 'Đang mở'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleSlot(slot.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        slot.locked
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {slot.locked ? (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          Mở khóa
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          Khóa
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="font-semibold text-slate-700 mb-2">Ghi chú:</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            Slot đang mở - Khách hàng có thể đặt lịch
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            BR-A45: Slot đã khóa - Không cho phép booking
          </li>
          <li className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            BR-A03: Slot đầy - Đã đạt capacity tối đa
          </li>
        </ul>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Thêm Slot Mới
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
              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Giờ
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Max Capacity (BR-A02) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Capacity Tối Đa (BR-A02)
                </label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={10}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <p className="text-xs text-slate-500 mt-1">
                  BR-A02: Giới hạn số xe tối đa trong slot này
                </p>
              </div>

              {/* Duration (BR-A56) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Duration (phút) - BR-A56
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min={minServiceDuration}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <p className="text-xs text-slate-500 mt-1">
                  BR-A56: Phải {">"} 0 và {">="} {minServiceDuration} phút (service duration tối thiểu)
                </p>
              </div>

              {/* Business Rules Summary */}
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                <strong>Quy tắc kiểm tra:</strong>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  <li>BR-A02: Capacity phải {">"} 0</li>
                  <li>BR-A56: Duration {">"} 0 và {">="} {minServiceDuration}p</li>
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
                onClick={addSlot}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Thêm Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
