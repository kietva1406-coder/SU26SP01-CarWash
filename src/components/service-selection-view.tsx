'use client';

import { useState } from 'react';
import { ChevronRight, Clock, DollarSign, Package } from 'lucide-react';
import { MOCK_SERVICES, MOCK_COMBOS } from '@/lib/mock-data';

interface ServiceSelectionViewProps {
  onServiceSelected: (serviceIds: string[]) => void;
  selectedServices?: string[];
}

export default function ServiceSelectionView({ onServiceSelected, selectedServices = [] }: ServiceSelectionViewProps) {
  const [localSelectedServices, setLocalSelectedServices] = useState<string[]>(selectedServices);
  const [selectedComboId, setSelectedComboId] = useState<string | null>(null);
  
  const activeServices = MOCK_SERVICES.filter((s) => s.active);
  const activeCombos = MOCK_COMBOS.filter((c) => c.active);

  // Toggle individual service
  const toggleService = (serviceId: string) => {
    setSelectedComboId(null); // Clear combo selection when choosing individual services
    setLocalSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Select combo (replaces individual service selection)
  const selectCombo = (comboId: string) => {
    const combo = activeCombos.find(c => c.id === comboId);
    if (combo) {
      setSelectedComboId(comboId);
      setLocalSelectedServices(combo.services);
    }
  };

  const handleNext = () => {
    if (localSelectedServices.length > 0) {
      onServiceSelected(localSelectedServices);
    }
  };

  const canProceed = localSelectedServices.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chọn dịch vụ</h2>
        <p className="text-slate-600">Vui lòng chọn ít nhất một dịch vụ hoặc một gói combo để tiếp tục</p>
      </div>

      {/* Combo Packages Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Gói Combo (Tiết Kiệm)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCombos.map((combo) => (
            <button
              key={combo.id}
              onClick={() => selectCombo(combo.id)}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                selectedComboId === combo.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{combo.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{combo.description}</p>
                </div>
                
                {/* Selection Indicator */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-2 flex-shrink-0 ${
                  selectedComboId === combo.id
                    ? 'border-green-600 bg-green-600'
                    : 'border-slate-300'
                }`}>
                  {selectedComboId === combo.id && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
              </div>

              {/* Combo Services Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {MOCK_SERVICES.filter(s => combo.services.includes(s.id))
                  .map(s => (
                    <span key={s.id} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {s.name}
                    </span>
                  ))}
              </div>

              {/* Combo Details */}
              <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-2">
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{combo.totalDuration} phút</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-green-600">{combo.totalPriceDisplay}</span>
                  {combo.discount && combo.discount > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      -{combo.discount}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t-2 border-slate-200 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Dịch Vụ Lẻ</h3>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeServices.map((service) => (
            <button
              key={service.id}
              onClick={() => toggleService(service.id)}
              disabled={selectedComboId !== null}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedComboId !== null
                  ? 'opacity-50 cursor-not-allowed'
                  : localSelectedServices.includes(service.id)
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-base mb-1">{service.name}</h4>
                  <p className="text-sm text-slate-600">{service.description}</p>
                </div>
                
                {/* Selection Indicator */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-3 flex-shrink-0 ${
                  localSelectedServices.includes(service.id) && selectedComboId === null
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-slate-300'
                }`}>
                  {localSelectedServices.includes(service.id) && selectedComboId === null && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} phút</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>{service.priceDisplay}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Services Summary */}
      {localSelectedServices.length > 0 && (
        <div className={`border rounded-xl p-4 ${
          selectedComboId ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-200'
        }`}>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">
              {selectedComboId ? 'Gói combo đã chọn:' : `Đã chọn ${localSelectedServices.length} dịch vụ:`}
            </p>
            <div className="flex flex-wrap gap-2">
              {activeServices
                .filter(s => localSelectedServices.includes(s.id))
                .map(s => (
                  <div
                    key={s.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm text-slate-900 ${
                      selectedComboId ? 'border border-green-300' : 'border border-indigo-300'
                    }`}
                  >
                    {s.name}
                    <span className={selectedComboId ? 'text-green-600 font-semibold' : 'text-indigo-600 font-semibold'}>
                      {s.priceDisplay}
                    </span>
                  </div>
                ))}
            </div>
            
            {/* Total Duration and Price */}
            <div className={`pt-3 border-t mt-3 ${selectedComboId ? 'border-green-200' : 'border-indigo-200'}`}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">Tổng thời gian:</span>
                <span className="font-semibold text-slate-900">
                  {activeServices
                    .filter(s => localSelectedServices.includes(s.id))
                    .reduce((sum, s) => sum + s.duration, 0)} phút
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-700">Tổng giá:</span>
                <div className="flex items-center gap-2">
                  <span className={selectedComboId ? 'font-semibold text-green-600' : 'font-semibold text-indigo-600'}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(
                      activeServices
                        .filter(s => localSelectedServices.includes(s.id))
                        .reduce((sum, s) => sum + s.price, 0)
                    )}
                  </span>
                  {selectedComboId && (
                    <span className="text-xs text-green-700 font-medium">
                      (Tiết kiệm {MOCK_COMBOS.find(c => c.id === selectedComboId)?.discount}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedComboId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <p>Bạn đang sử dụng gói combo. Để chọn dịch vụ lẻ, vui lòng nhấn "Tiếp tục" hoặc thay đổi lựa chọn.</p>
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!canProceed}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
          canProceed
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        Tiếp tục
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
