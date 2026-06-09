export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type UserRole = 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN';

export interface Request {
  id: string;
  customerId: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface TaskAssignment {
  id: string;
  requestId: string;
  assignedTo: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
