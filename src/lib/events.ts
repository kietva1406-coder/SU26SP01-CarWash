import { Event, EventType, Voucher } from './types';
import { MOCK_EVENTS, MOCK_VOUCHERS } from './mock-data';

// Get all visible events
export function getVisibleEvents(): Event[] {
  return MOCK_EVENTS.filter(e => e.isVisible)
    .sort((a, b) => b.priority - a.priority);
}

// Get active events (visible and within date range)
export function getActiveEvents(): Event[] {
  const now = new Date();
  return getVisibleEvents().filter(e => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    return now >= start && now <= end;
  });
}

// Get upcoming events (visible and starting in the future)
export function getUpcomingEvents(): Event[] {
  const now = new Date();
  return getVisibleEvents().filter(e => {
    const start = new Date(e.startDate);
    return now < start;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

// Get past events (visible and ended)
export function getPastEvents(): Event[] {
  const now = new Date();
  return getVisibleEvents().filter(e => {
    const end = new Date(e.endDate);
    return now > end;
  }).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
}

// Get events by type
export function getEventsByType(type: EventType): Event[] {
  return getVisibleEvents().filter(e => e.eventType === type);
}

// Get event by ID
export function getEventById(id: string): Event | undefined {
  return MOCK_EVENTS.find(e => e.id === id);
}

// Get voucher linked to an event
export function getEventVoucher(event: Event): Voucher | undefined {
  if (!event.linkedVoucherId) return undefined;
  return MOCK_VOUCHERS.find(v => v.id === event.linkedVoucherId);
}

// Get event status
export function getEventStatus(event: Event): {
  status: 'active' | 'upcoming' | 'ended' | 'hidden';
  label: string;
  color: string;
  bgColor: string;
} {
  if (!event.isVisible) {
    return {
      status: 'hidden',
      label: 'Ẩn',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    };
  }

  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (now < start) {
    return {
      status: 'upcoming',
      label: 'Sắp diễn ra',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    };
  }

  if (now > end) {
    return {
      status: 'ended',
      label: 'Đã kết thúc',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    };
  }

  return {
    status: 'active',
    label: 'Đang diễn ra',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  };
}

// Get event type label and color
export function getEventTypeInfo(type: EventType): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (type) {
    case 'PROMOTION':
      return { label: 'Khuyến mãi', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    case 'FLASH_SALE':
      return { label: 'Flash Sale', color: 'text-red-600', bgColor: 'bg-red-100' };
    case 'HOLIDAY':
      return { label: 'Lễ hội', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    case 'NEWS':
      return { label: 'Tin tức', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    case 'ANNOUNCEMENT':
      return { label: 'Thông báo', color: 'text-slate-600', bgColor: 'bg-slate-100' };
    default:
      return { label: type, color: 'text-slate-600', bgColor: 'bg-slate-100' };
  }
}

// Format event date range
export function formatEventDateRange(event: Event): string {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  return `${start.toLocaleDateString('vi-VN', formatOptions)} - ${end.toLocaleDateString('vi-VN', formatOptions)}`;
}

// Calculate days remaining for an event
export function getEventDaysRemaining(event: Event): number {
  const now = new Date();
  const end = new Date(event.endDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check if event is ending soon (within 3 days)
export function isEventEndingSoon(event: Event): boolean {
  const daysRemaining = getEventDaysRemaining(event);
  return daysRemaining > 0 && daysRemaining <= 3;
}

// Increment event view count (for mock, just return new count)
export function incrementEventViewCount(eventId: string): number {
  const event = getEventById(eventId);
  if (!event) return 0;
  // In real app, this would update the database
  return event.viewCount + 1;
}

// Get featured events (active with high priority)
export function getFeaturedEvents(limit: number = 3): Event[] {
  return getActiveEvents()
    .filter(e => e.eventType === 'FLASH_SALE' || e.eventType === 'PROMOTION')
    .slice(0, limit);
}

// Search events
export function searchEvents(query: string): Event[] {
  const lowerQuery = query.toLowerCase();
  return getVisibleEvents().filter(e => 
    e.title.toLowerCase().includes(lowerQuery) ||
    e.description.toLowerCase().includes(lowerQuery) ||
    (e.shortDescription && e.shortDescription.toLowerCase().includes(lowerQuery))
  );
}
