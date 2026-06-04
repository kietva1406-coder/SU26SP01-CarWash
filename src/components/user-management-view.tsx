'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_USERS, MOCK_LOYALTY_TRANSACTIONS } from '@/lib/mock-data';
import { User, UserRole, LOYALTY_CONFIG, LoyaltyTransaction, BirthdayVoucher } from '@/lib/types';
import { getRoleDisplayName } from '@/lib/permissions';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Shield, 
  Phone,
  Mail,
  Lock,
  AlertCircle,
  UserCircle,
  Car,
  Award,
  Gift,
  Cake,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

type ViewMode = 'employees' | 'customers';
type LoyaltyTier = 'UNRANK' | 'BRONZE' | 'SILVER' | 'GOLD';

// Calculate customer loyalty points and tier
const getCustomerLoyalty = (customerId: string): { points: number; tier: LoyaltyTier } => {
  const transactions = MOCK_LOYALTY_TRANSACTIONS.filter(
    t => t.customerId === customerId && t.status === 'COMPLETED'
  );
  
  const totalPoints = transactions.reduce((sum, t) => {
    if (t.type === 'EARN') return sum + t.points;
    if (t.type === 'REDEEM') return sum - t.points;
    return sum;
  }, 0);
  
  // Determine tier based on total points (new tier system)
  let tier: LoyaltyTier = 'UNRANK';
  if (totalPoints >= LOYALTY_CONFIG.tierThresholds.GOLD) {
    tier = 'GOLD';
  } else if (totalPoints >= LOYALTY_CONFIG.tierThresholds.SILVER) {
    tier = 'SILVER';
  } else if (totalPoints >= LOYALTY_CONFIG.tierThresholds.BRONZE) {
    tier = 'BRONZE';
  }
  
  return { points: totalPoints, tier };
};

// Get tier display info
const getTierInfo = (tier: LoyaltyTier): { label: string; color: string; bgColor: string } => {
  switch (tier) {
    case 'GOLD':
      return { label: 'Vàng', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    case 'SILVER':
      return { label: 'Bạc', color: 'text-slate-700', bgColor: 'bg-slate-200' };
    case 'BRONZE':
      return { label: 'Đồng', color: 'text-amber-700', bgColor: 'bg-amber-100' };
    case 'UNRANK':
    default:
      return { label: 'Chưa xếp hạng', color: 'text-slate-500', bgColor: 'bg-slate-100' };
  }
};

export default function UserManagementView() {
  const { user, permissions } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('employees');
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [editingCustomerLoyalty, setEditingCustomerLoyalty] = useState<User | null>(null);
  const [loyaltyFormData, setLoyaltyFormData] = useState({
    tier: 'UNRANK' as LoyaltyTier,
    pointsAdjustment: 0,
    adjustmentReason: '',
    birthday: '',
  });
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherFormData, setVoucherFormData] = useState({
    discountPercent: 10,
    validDays: 30,
  });
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff' as UserRole,
  });

  if (!user || !permissions || !permissions.canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Lock className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Không có quyền truy cập</h2>
        <p className="text-slate-500 mt-2">
          Chỉ Admin và Quản lý mới được quản lý người dùng
        </p>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';

  // Filter users based on view mode and role
  const employees = users.filter(u => u.role === 'staff' || u.role === 'manager' || u.role === 'admin');
  const customers = users.filter(u => u.role === 'customer');
  
  // Manager can only see/manage staff, Admin can see all employees
  const visibleEmployees = isManager 
    ? employees.filter(u => u.role === 'staff')
    : employees;
  
  const displayedUsers = viewMode === 'employees' ? visibleEmployees : customers;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: viewMode === 'customers' ? 'customer' : 'staff',
    });
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      return;
    }

    const newUser: User = {
      id: `USR${String(users.length + 1).padStart(3, '0')}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
    };

    setUsers([...users, newUser]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!editingUser || !formData.name || !formData.email) {
      return;
    }

    const updatedUsers = users.map(u => 
      u.id === editingUser.id 
        ? { ...u, name: formData.name, email: formData.email, phone: formData.phone || undefined, role: formData.role }
        : u
    );

    setUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
    resetForm();
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    setShowDeleteConfirm(null);
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      phone: userToEdit.phone || '',
      role: userToEdit.role,
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'manager':
        return 'bg-purple-100 text-purple-700';
      case 'staff':
        return 'bg-blue-100 text-blue-700';
      case 'customer':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Get available roles for dropdown based on current user's role and view mode
  const getAvailableRoles = (): UserRole[] => {
    if (viewMode === 'customers') {
      return ['customer'];
    }
    if (isManager) {
      return ['staff']; // Manager can only add/edit staff
    }
    return ['staff', 'manager', 'admin']; // Admin can manage all roles
  };

  // Check if user can edit/delete another user
  const canModifyUser = (targetUser: User): boolean => {
    // Can't modify yourself
    if (targetUser.id === user.id) return false;
    
    // Admin can modify anyone
    if (isAdmin) return true;
    
    // Manager can only modify staff
    if (isManager && targetUser.role === 'staff') return true;
    
    return false;
  };

  // Check if user can change role of another user
  const canChangeRole = (targetUser: User): boolean => {
    if (targetUser.id === user.id) return false;
    if (isAdmin) return true;
    return false; // Manager cannot change roles
  };

  // Open loyalty management modal for a customer
  const openLoyaltyModal = (customer: User) => {
    const loyalty = getCustomerLoyalty(customer.id);
    setEditingCustomerLoyalty(customer);
    setLoyaltyFormData({
      tier: loyalty.tier,
      pointsAdjustment: 0,
      adjustmentReason: '',
      birthday: '',
    });
    setShowLoyaltyModal(true);
  };

  // Handle loyalty adjustment
  const handleLoyaltyAdjustment = () => {
    if (!editingCustomerLoyalty || !loyaltyFormData.adjustmentReason) return;
    
    // In real app, this would create a new LoyaltyTransaction and update the customer
    console.log('Loyalty adjustment:', {
      customerId: editingCustomerLoyalty.id,
      tier: loyaltyFormData.tier,
      pointsAdjustment: loyaltyFormData.pointsAdjustment,
      reason: loyaltyFormData.adjustmentReason,
      birthday: loyaltyFormData.birthday,
    });
    
    setShowLoyaltyModal(false);
    setEditingCustomerLoyalty(null);
  };

  // Open voucher creation modal
  const openVoucherModal = (customer: User) => {
    setEditingCustomerLoyalty(customer);
    setVoucherFormData({
      discountPercent: 10,
      validDays: 30,
    });
    setShowVoucherModal(true);
  };

  // Handle voucher creation
  const handleCreateVoucher = () => {
    if (!editingCustomerLoyalty) return;
    
    // In real app, this would create a BirthdayVoucher
    console.log('Creating voucher:', {
      customerId: editingCustomerLoyalty.id,
      discountPercent: voucherFormData.discountPercent,
      validDays: voucherFormData.validDays,
    });
    
    setShowVoucherModal(false);
    setEditingCustomerLoyalty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {viewMode === 'employees' ? 'Quản Lý Nhân Viên' : 'Quản Lý Khách Hàng'}
          </h2>
          <p className="text-slate-500 mt-1">
            {viewMode === 'employees' 
              ? (isManager ? 'Xem và quản lý thông tin nhân viên' : 'Xem, thêm và chỉnh sửa thông tin nhân viên')
              : 'Xem, thêm và chỉnh sửa thông tin khách hàng'
            }
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {viewMode === 'employees' ? 'Thêm Nhân Viên' : 'Thêm Khách Hàng'}
        </button>
      </div>

      {/* Tab switcher - Only show for Admin */}
      {isAdmin && permissions.canManageCustomers && (
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setViewMode('employees')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              viewMode === 'employees'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Nhân Viên ({employees.length})
            </div>
          </button>
          <button
            onClick={() => setViewMode('customers')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              viewMode === 'customers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Khách Hàng ({customers.length})
            </div>
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {viewMode === 'employees' ? (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Tổng nhân viên</div>
                  <div className="text-xl font-bold text-slate-900">{visibleEmployees.length}</div>
                </div>
              </div>
            </div>
            {isAdmin && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Admin</div>
                    <div className="text-xl font-bold text-slate-900">{users.filter(u => u.role === 'admin').length}</div>
                  </div>
                </div>
              </div>
            )}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Quản lý</div>
                    <div className="text-xl font-bold text-slate-900">{users.filter(u => u.role === 'manager').length}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Nhân viên</div>
                  <div className="text-xl font-bold text-slate-900">{users.filter(u => u.role === 'staff').length}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Tổng khách hàng</div>
                  <div className="text-xl font-bold text-slate-900">{customers.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Car className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Có SĐT</div>
                  <div className="text-xl font-bold text-slate-900">{customers.filter(c => c.phone).length}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {viewMode === 'employees' ? 'Danh Sách Nhân Viên' : 'Danh Sách Khách Hàng'}
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                {viewMode === 'employees' ? 'Mã NV' : 'Mã KH'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Điện thoại</th>
              {viewMode === 'customers' && (
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Hạng thành viên</th>
              )}
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Vai trò</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayedUsers.map((u) => {
              const loyalty = viewMode === 'customers' ? getCustomerLoyalty(u.id) : null;
              const tierInfo = loyalty ? getTierInfo(loyalty.tier) : null;
              
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono text-indigo-600">{u.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{u.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.phone ? (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {u.phone}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  {viewMode === 'customers' && loyalty && tierInfo && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tierInfo.bgColor} ${tierInfo.color}`}>
                          <Award className="w-3.5 h-3.5" />
                          {tierInfo.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({loyalty.points} điểm)
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(u.role)}`}>
                      {getRoleDisplayName(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {viewMode === 'customers' && isAdmin && (
                        <>
                          <button
                            onClick={() => openLoyaltyModal(u)}
                            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Quản lý hạng & điểm"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openVoucherModal(u)}
                            className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                            title="Tạo voucher sinh nhật"
                          >
                            <Gift className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {canModifyUser(u) && (
                        <button
                          onClick={() => setShowDeleteConfirm(u.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {displayedUsers.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500">
            {viewMode === 'employees' 
              ? 'Chưa có nhân viên nào. Nhấn "Thêm Nhân Viên" để bắt đầu.'
              : 'Chưa có khách hàng nào. Nhấn "Thêm Khách Hàng" để bắt đầu.'
            }
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {viewMode === 'employees' ? 'Thêm Nhân Viên Mới' : 'Thêm Khách Hàng Mới'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên {viewMode === 'employees' ? 'nhân viên' : 'khách hàng'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={viewMode === 'employees' ? 'Nhập tên nhân viên' : 'Nhập tên khách hàng'}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              {viewMode === 'employees' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {getAvailableRoles().map(role => (
                      <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                    ))}
                  </select>
                  {isManager && (
                    <p className="text-xs text-slate-500 mt-1">
                      Quản lý chỉ có thể thêm nhân viên
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddUser}
                disabled={!formData.name || !formData.email}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Chỉnh Sửa Thông Tin</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">
                  {editingUser.role === 'customer' ? 'Mã khách hàng:' : 'Mã nhân viên:'}
                </span>
                <span className="ml-2 font-mono text-indigo-600">{editingUser.id}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              {editingUser.role !== 'customer' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    disabled={!canChangeRole(editingUser)}
                  >
                    {isAdmin ? (
                      <>
                        <option value="staff">Nhân Viên</option>
                        <option value="manager">Quản Lý</option>
                        <option value="admin">Admin</option>
                      </>
                    ) : (
                      <option value="staff">Nhân Viên</option>
                    )}
                  </select>
                  {editingUser.id === user.id && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Không thể thay đổi vai trò của chính mình
                    </p>
                  )}
                  {isManager && editingUser.id !== user.id && (
                    <p className="text-xs text-slate-500 mt-1">
                      Quản lý không thể thay đổi vai trò
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleEditUser}
                disabled={!formData.name || !formData.email}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                Lưu
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
                Bạn có chắc chắn muốn xóa {viewMode === 'employees' ? 'nhân viên' : 'khách hàng'} này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loyalty Management Modal - Admin Only */}
      {showLoyaltyModal && editingCustomerLoyalty && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Quản Lý Hạng & Điểm Thưởng</h3>
              <button
                onClick={() => {
                  setShowLoyaltyModal(false);
                  setEditingCustomerLoyalty(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{editingCustomerLoyalty.name}</div>
                    <div className="text-sm text-slate-500">Mã KH: {editingCustomerLoyalty.id}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  {(() => {
                    const loyalty = getCustomerLoyalty(editingCustomerLoyalty.id);
                    const tierInfo = getTierInfo(loyalty.tier);
                    return (
                      <>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tierInfo.bgColor} ${tierInfo.color}`}>
                          <Award className="w-3.5 h-3.5" />
                          {tierInfo.label}
                        </span>
                        <span className="text-sm text-slate-600">
                          Điểm hiện tại: <strong>{loyalty.points}</strong>
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Tier Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Thay đổi hạng thành viên
                </label>
                <select
                  value={loyaltyFormData.tier}
                  onChange={(e) => setLoyaltyFormData({ ...loyaltyFormData, tier: e.target.value as LoyaltyTier })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="UNRANK">Chưa xếp hạng</option>
                  <option value="BRONZE">Đồng (100+ điểm)</option>
                  <option value="SILVER">Bạc (300+ điểm) - Giảm 5%</option>
                  <option value="GOLD">Vàng (700+ điểm) - Giảm 10%</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Admin có toàn quyền thay đổi hạng bất kể số điểm
                </p>
              </div>

              {/* Points Adjustment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Điều chỉnh điểm
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLoyaltyFormData({ ...loyaltyFormData, pointsAdjustment: loyaltyFormData.pointsAdjustment - 10 })}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <TrendingDown className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={loyaltyFormData.pointsAdjustment}
                    onChange={(e) => setLoyaltyFormData({ ...loyaltyFormData, pointsAdjustment: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-center"
                    placeholder="0"
                  />
                  <button
                    onClick={() => setLoyaltyFormData({ ...loyaltyFormData, pointsAdjustment: loyaltyFormData.pointsAdjustment + 10 })}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Số dương: cộng điểm | Số âm: trừ điểm
                </p>
              </div>

              {/* Adjustment Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lý do điều chỉnh <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={loyaltyFormData.adjustmentReason}
                  onChange={(e) => setLoyaltyFormData({ ...loyaltyFormData, adjustmentReason: e.target.value })}
                  placeholder="Nhập lý do điều chỉnh..."
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ngày sinh (để nhận voucher sinh nhật)
                </label>
                <div className="flex items-center gap-2">
                  <Cake className="w-5 h-5 text-pink-500" />
                  <input
                    type="date"
                    value={loyaltyFormData.birthday}
                    onChange={(e) => setLoyaltyFormData({ ...loyaltyFormData, birthday: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowLoyaltyModal(false);
                  setEditingCustomerLoyalty(null);
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLoyaltyAdjustment}
                disabled={!loyaltyFormData.adjustmentReason}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Voucher Modal - Admin Only */}
      {showVoucherModal && editingCustomerLoyalty && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Tạo Voucher Sinh Nhật</h3>
              <button
                onClick={() => {
                  setShowVoucherModal(false);
                  setEditingCustomerLoyalty(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Cake className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{editingCustomerLoyalty.name}</div>
                    <div className="text-sm text-pink-600">Voucher sinh nhật</div>
                  </div>
                </div>
              </div>

              {/* Discount Percent */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phần trăm giảm giá
                </label>
                <select
                  value={voucherFormData.discountPercent}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, discountPercent: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                >
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                  <option value={15}>15%</option>
                  <option value={20}>20%</option>
                  <option value={25}>25%</option>
                  <option value={30}>30%</option>
                  <option value={50}>50%</option>
                </select>
              </div>

              {/* Valid Days */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Thời hạn sử dụng (ngày)
                </label>
                <input
                  type="number"
                  value={voucherFormData.validDays}
                  onChange={(e) => setVoucherFormData({ ...voucherFormData, validDays: parseInt(e.target.value) || 30 })}
                  min={1}
                  max={365}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  <strong>Lưu ý:</strong> Admin có toàn quyền tạo và quản lý voucher cho khách hàng.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowVoucherModal(false);
                  setEditingCustomerLoyalty(null);
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateVoucher}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Gift className="w-4 h-4" />
                Tạo Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
