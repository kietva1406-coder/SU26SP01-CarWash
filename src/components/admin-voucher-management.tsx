'use client';

import { useState, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  Filter,
  Calendar,
  Percent,
  Users,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Tag,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Voucher, ExtendedLoyaltyTier } from '@/lib/types';
import { MOCK_VOUCHERS } from '@/lib/mock-data';
import { getVoucherStatus, formatVoucherDiscount, getRemainingUsage } from '@/lib/voucher';

type VoucherFormData = {
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountAmount: number | undefined;
  minOrderValue: number;
  usageLimit: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  applicableRanks: ExtendedLoyaltyTier[];
  isActive: boolean;
};

const INITIAL_FORM_DATA: VoucherFormData = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  discountValue: 10,
  maxDiscountAmount: undefined,
  minOrderValue: 0,
  usageLimit: 100,
  perUserLimit: 1,
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  applicableRanks: ['UNRANK', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'],
  isActive: true,
};

const ALL_RANKS: ExtendedLoyaltyTier[] = ['UNRANK', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

const RANK_LABELS: Record<ExtendedLoyaltyTier, string> = {
  UNRANK: 'Mới',
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch Kim',
  DIAMOND: 'Kim Cương',
};

export function AdminVoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>(MOCK_VOUCHERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState<VoucherFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      // Search filter
      const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const status = getVoucherStatus(v);
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = status.status === 'active';
      else if (statusFilter === 'inactive') matchesStatus = status.status === 'inactive';
      else if (statusFilter === 'expired') matchesStatus = status.status === 'expired' || status.status === 'depleted';

      return matchesSearch && matchesStatus;
    });
  }, [vouchers, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const paginatedVouchers = filteredVouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open create modal
  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors([]);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxDiscountAmount: voucher.maxDiscountAmount,
      minOrderValue: voucher.minOrderValue || 0,
      usageLimit: voucher.usageLimit,
      perUserLimit: voucher.perUserLimit,
      validFrom: voucher.validFrom.split('T')[0],
      validUntil: voucher.validUntil.split('T')[0],
      applicableRanks: voucher.applicableRanks,
      isActive: voucher.isActive,
    });
    setFormErrors([]);
    setShowModal(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.code.trim()) {
      errors.push('Mã voucher không được để trống');
    } else if (!/^[A-Z0-9]+$/i.test(formData.code)) {
      errors.push('Mã voucher chỉ được chứa chữ cái và số');
    }

    // Check for duplicate code (except when editing the same voucher)
    const existingVoucher = vouchers.find(
      v => v.code.toUpperCase() === formData.code.toUpperCase() && v.id !== editingVoucher?.id
    );
    if (existingVoucher) {
      errors.push('Mã voucher đã tồn tại');
    }

    if (!formData.description.trim()) {
      errors.push('Mô tả không được để trống');
    }

    if (formData.discountValue <= 0) {
      errors.push('Giá trị giảm giá phải lớn hơn 0');
    }

    if (formData.discountType === 'PERCENT' && formData.discountValue > 100) {
      errors.push('Phần trăm giảm giá không được vượt quá 100%');
    }

    if (new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      errors.push('Ngày kết thúc phải sau ngày bắt đầu');
    }

    if (formData.applicableRanks.length === 0) {
      errors.push('Phải chọn ít nhất một hạng thành viên');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  // Handle form submit
  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (editingVoucher) {
      // Update existing voucher
      setVouchers(prev => prev.map(v =>
        v.id === editingVoucher.id
          ? {
              ...v,
              code: formData.code.toUpperCase(),
              description: formData.description,
              discountType: formData.discountType,
              discountValue: formData.discountValue,
              maxDiscountAmount: formData.maxDiscountAmount,
              minOrderValue: formData.minOrderValue,
              usageLimit: formData.usageLimit,
              perUserLimit: formData.perUserLimit,
              validFrom: new Date(formData.validFrom).toISOString(),
              validUntil: new Date(formData.validUntil + 'T23:59:59').toISOString(),
              applicableRanks: formData.applicableRanks,
              isActive: formData.isActive,
              updatedAt: now,
            }
          : v
      ));
    } else {
      // Create new voucher
      const newVoucher: Voucher = {
        id: `VCH${Date.now()}`,
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        maxDiscountAmount: formData.maxDiscountAmount,
        minOrderValue: formData.minOrderValue,
        usageLimit: formData.usageLimit,
        usedCount: 0,
        perUserLimit: formData.perUserLimit,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil + 'T23:59:59').toISOString(),
        applicableRanks: formData.applicableRanks,
        applicableServices: [],
        isActive: formData.isActive,
        createdBy: 'USR004', // Admin ID
        createdAt: now,
        updatedAt: now,
      };
      setVouchers(prev => [newVoucher, ...prev]);
    }

    setShowModal(false);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
    setShowDeleteConfirm(null);
  };

  // Toggle voucher active status
  const toggleActive = (voucher: Voucher) => {
    setVouchers(prev => prev.map(v =>
      v.id === voucher.id ? { ...v, isActive: !v.isActive, updatedAt: new Date().toISOString() } : v
    ));
  };

  // Toggle rank in form
  const toggleRank = (rank: ExtendedLoyaltyTier) => {
    setFormData(prev => ({
      ...prev,
      applicableRanks: prev.applicableRanks.includes(rank)
        ? prev.applicableRanks.filter(r => r !== rank)
        : [...prev.applicableRanks, rank],
    }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Voucher</h2>
          <p className="text-slate-500 mt-1">Tạo và quản lý mã giảm giá cho khách hàng</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo Voucher
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
            placeholder="Tìm theo mã hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu</option>
            <option value="expired">Hết hạn/Hết lượt</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">Tổng Voucher</div>
          <div className="text-2xl font-bold text-slate-900">{vouchers.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">Đang Hoạt Động</div>
          <div className="text-2xl font-bold text-green-600">
            {vouchers.filter(v => getVoucherStatus(v).status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">Đã Hết Hạn</div>
          <div className="text-2xl font-bold text-red-600">
            {vouchers.filter(v => getVoucherStatus(v).status === 'expired').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">Tổng Lượt Sử Dụng</div>
          <div className="text-2xl font-bold text-indigo-600">
            {vouchers.reduce((sum, v) => sum + v.usedCount, 0)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mã</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mô Tả</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Giảm Giá</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Thời Hạn</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sử Dụng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Trạng Thái</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedVouchers.map((voucher) => {
              const status = getVoucherStatus(voucher);
              return (
                <tr key={voucher.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-indigo-600">{voucher.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate text-sm text-slate-600">{voucher.description}</div>
                    {voucher.applicableRanks.length < 6 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-slate-400">
                          {voucher.applicableRanks.map(r => RANK_LABELS[r]).join(', ')}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{formatVoucherDiscount(voucher)}</div>
                    {voucher.minOrderValue && voucher.minOrderValue > 0 && (
                      <div className="text-xs text-slate-400">
                        Tối thiểu {formatCurrency(voucher.minOrderValue)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-600">
                      {new Date(voucher.validFrom).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-slate-400">
                      đến {new Date(voucher.validUntil).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{getRemainingUsage(voucher)}</div>
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ 
                          width: voucher.usageLimit > 0 
                            ? `${Math.min(100, (voucher.usedCount / voucher.usageLimit) * 100)}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(voucher)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          voucher.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={voucher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {voucher.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(voucher)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(voucher.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {paginatedVouchers.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <Ticket className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Không tìm thấy voucher nào</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredVouchers.length)} / {filteredVouchers.length}
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
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingVoucher ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Mới'}
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

              {/* Code & Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: SUMMER20"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Trạng thái
                  </label>
                  <div className="flex items-center gap-3 h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">Kích hoạt ngay</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="VD: Giảm 20% cho đơn hàng mùa hè"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại giảm giá
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENT' | 'FIXED_AMOUNT' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Giá trị {formData.discountType === 'PERCENT' ? '(%)' : '(VND)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    min={0}
                    max={formData.discountType === 'PERCENT' ? 100 : undefined}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {formData.discountType === 'PERCENT' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Giảm tối đa (VND)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount || ''}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Không giới hạn"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Min Order & Usage Limits */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Đơn tối thiểu (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tổng lượt dùng
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    min={0}
                    placeholder="0 = không giới hạn"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Lượt/khách hàng
                  </label>
                  <input
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: Number(e.target.value) })}
                    min={0}
                    placeholder="0 = không giới hạn"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Applicable Ranks */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hạng thành viên được áp dụng
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_RANKS.map(rank => (
                    <button
                      key={rank}
                      onClick={() => toggleRank(rank)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formData.applicableRanks.includes(rank)
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                          : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {RANK_LABELS[rank]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setFormData({ ...formData, applicableRanks: [...ALL_RANKS] })}
                  className="mt-2 text-xs text-indigo-600 hover:underline"
                >
                  Chọn tất cả
                </button>
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
                {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
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
                Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể hoàn tác.
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

export default AdminVoucherManagement;
