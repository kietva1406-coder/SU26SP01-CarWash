'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Tag,
  Ticket,
  Eye,
  ChevronRight,
  X,
  Zap,
  Gift,
  Sparkles,
  Bell,
  Megaphone,
  Filter,
  Search
} from 'lucide-react';
import { Event, EventType, Voucher } from '@/lib/types';
import { MOCK_EVENTS } from '@/lib/mock-data';
import {
  getActiveEvents,
  getUpcomingEvents,
  getEventVoucher,
  getEventStatus,
  getEventTypeInfo,
  formatEventDateRange,
  getEventDaysRemaining,
  isEventEndingSoon,
  searchEvents
} from '@/lib/events';
import { formatVoucherDiscount, getVoucherStatus } from '@/lib/voucher';

const EVENT_TYPE_ICONS: Record<EventType, React.ElementType> = {
  PROMOTION: Tag,
  FLASH_SALE: Zap,
  HOLIDAY: Gift,
  NEWS: Bell,
  ANNOUNCEMENT: Megaphone,
};

export default function EventsListView() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Get events
  const allEvents = useMemo(() => {
    let events = MOCK_EVENTS.filter(e => e.isVisible);
    
    if (filterType !== 'ALL') {
      events = events.filter(e => e.eventType === filterType);
    }
    
    if (searchQuery.trim()) {
      events = searchEvents(searchQuery);
      if (filterType !== 'ALL') {
        events = events.filter(e => e.eventType === filterType);
      }
    }
    
    return events.sort((a, b) => b.priority - a.priority);
  }, [filterType, searchQuery]);

  const activeEvents = getActiveEvents();
  const upcomingEvents = getUpcomingEvents();

  // Get linked voucher for selected event
  const selectedEventVoucher = useMemo(() => {
    if (!selectedEvent) return null;
    return getEventVoucher(selectedEvent);
  }, [selectedEvent]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tin tức & Ưu đãi</h2>
        <p className="text-slate-500 mt-1">Khám phá các chương trình khuyến mãi và sự kiện đặc biệt</p>
      </div>

      {/* Featured Events Banner */}
      {activeEvents.filter(e => e.eventType === 'FLASH_SALE').length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-red-100">Flash Sale đang diễn ra!</div>
              <div className="text-xl font-bold">
                {activeEvents.filter(e => e.eventType === 'FLASH_SALE')[0]?.title}
              </div>
            </div>
          </div>
          <p className="text-red-100 text-sm mb-4">
            {activeEvents.filter(e => e.eventType === 'FLASH_SALE')[0]?.shortDescription}
          </p>
          <button 
            onClick={() => setSelectedEvent(activeEvents.filter(e => e.eventType === 'FLASH_SALE')[0])}
            className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sự kiện..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventType | 'ALL')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả</option>
            <option value="PROMOTION">Khuyến mãi</option>
            <option value="FLASH_SALE">Flash Sale</option>
            <option value="HOLIDAY">Lễ hội</option>
            <option value="NEWS">Tin tức</option>
            <option value="ANNOUNCEMENT">Thông báo</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{activeEvents.length}</div>
          <div className="text-sm text-green-600">Đang diễn ra</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{upcomingEvents.length}</div>
          <div className="text-sm text-blue-600">Sắp tới</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-700">
            {activeEvents.filter(e => e.linkedVoucherId).length}
          </div>
          <div className="text-sm text-orange-600">Có voucher</div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allEvents.map(event => {
          const status = getEventStatus(event);
          const typeInfo = getEventTypeInfo(event.eventType);
          const Icon = EVENT_TYPE_ICONS[event.eventType];
          const endingSoon = isEventEndingSoon(event);
          const daysRemaining = getEventDaysRemaining(event);
          const hasVoucher = !!event.linkedVoucherId;

          return (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all text-left group"
            >
              {/* Thumbnail */}
              <div className="relative h-32 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Icon className="w-12 h-12 text-indigo-400" />
                {/* Status badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                  {status.label}
                </div>
                {/* Ending soon badge */}
                {endingSoon && status.status === 'active' && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Còn {daysRemaining} ngày
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  {hasVoucher && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      Voucher
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                  {event.shortDescription || event.description.slice(0, 100)}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatEventDateRange(event)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {event.viewCount}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {allEvents.length === 0 && (
        <div className="py-12 text-center text-slate-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>Không tìm thấy sự kiện nào</p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-2 text-indigo-600 hover:underline text-sm"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = EVENT_TYPE_ICONS[selectedEvent.eventType];
                  const typeInfo = getEventTypeInfo(selectedEvent.eventType);
                  return (
                    <>
                      <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                        <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedEvent.title}</h2>
              
              {/* Status & Date */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {(() => {
                  const status = getEventStatus(selectedEvent);
                  return (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                      {status.label}
                    </span>
                  );
                })()}
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {formatEventDateRange(selectedEvent)}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Eye className="w-4 h-4" />
                  {selectedEvent.viewCount} lượt xem
                </span>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-slate-600 whitespace-pre-line">{selectedEvent.description}</p>
              </div>

              {/* Linked Voucher */}
              {selectedEventVoucher && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-700 mb-3">
                    <Ticket className="w-5 h-5" />
                    <span className="font-semibold">Voucher đi kèm</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-lg text-indigo-600">
                        {selectedEventVoucher.code}
                      </span>
                      {(() => {
                        const voucherStatus = getVoucherStatus(selectedEventVoucher);
                        return (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${voucherStatus.bgColor} ${voucherStatus.color}`}>
                            {voucherStatus.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{selectedEventVoucher.description}</p>
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <Sparkles className="w-4 h-4" />
                      {formatVoucherDiscount(selectedEventVoucher)}
                    </div>
                    {selectedEventVoucher.minOrderValue && selectedEventVoucher.minOrderValue > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        Đơn tối thiểu: {selectedEventVoucher.minOrderValue.toLocaleString('vi-VN')}đ
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-amber-600 mt-3">
                    Sao chép mã và sử dụng khi đặt lịch để được giảm giá!
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
