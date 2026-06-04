'use client';

import { useState } from 'react';
import { 
  Award, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Crown, 
  Gem, 
  Diamond,
  Search,
  Percent,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_RANK_CONFIGS } from '@/lib/mock-data';
import { RankConfig, ExtendedLoyaltyTier } from '@/lib/types';

const getTierIcon = (tier: ExtendedLoyaltyTier) => {
  switch (tier) {
    case 'DIAMOND':
      return <Diamond className="w-5 h-5" />;
    case 'PLATINUM':
      return <Gem className="w-5 h-5" />;
    case 'GOLD':
      return <Crown className="w-5 h-5" />;
    default:
      return <Award className="w-5 h-5" />;
  }
};

export default function AdminRankManagement() {
  const { user } = useAuth();
  const [ranks, setRanks] = useState<RankConfig[]>(MOCK_RANK_CONFIGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRank, setEditingRank] = useState<RankConfig | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    tier: 'BRONZE' as ExtendedLoyaltyTier,
    name: '',
    minPoints: 0,
    discountPercent: 0,
    pointMultiplier: 1.0,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: 'Award',
    benefits: [''],
  });

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Ban khong co quyen truy cap chuc nang nay.</p>
      </div>
    );
  }

  const filteredRanks = ranks.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingRank(null);
    setFormData({
      tier: 'BRONZE',
      name: '',
      minPoints: 0,
      discountPercent: 0,
      pointMultiplier: 1.0,
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      icon: 'Award',
      benefits: [''],
    });
    setShowModal(true);
  };

  const openEditModal = (rank: RankConfig) => {
    setEditingRank(rank);
    setFormData({
      tier: rank.tier,
      name: rank.name,
      minPoints: rank.minPoints,
      discountPercent: rank.discountPercent,
      pointMultiplier: rank.pointMultiplier,
      color: rank.color,
      bgColor: rank.bgColor,
      icon: rank.icon,
      benefits: [...rank.benefits],
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    if (editingRank) {
      // Update existing rank
      setRanks(prev => prev.map(r => 
        r.tier === editingRank.tier 
          ? { ...r, ...formData }
          : r
      ));
    } else {
      // Create new rank (in real app, this would need unique tier validation)
      const newRank: RankConfig = {
        ...formData,
        benefits: formData.benefits.filter(b => b.trim() !== ''),
      };
      setRanks(prev => [...prev, newRank].sort((a, b) => a.minPoints - b.minPoints));
    }

    setShowModal(false);
    setEditingRank(null);
  };

  const handleDelete = (tier: ExtendedLoyaltyTier) => {
    // Prevent deleting UNRANK as it's the default
    if (tier === 'UNRANK') return;
    setRanks(prev => prev.filter(r => r.tier !== tier));
    setShowDeleteConfirm(null);
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const colorOptions = [
    { color: 'text-slate-500', bgColor: 'bg-slate-100', label: 'Xam' },
    { color: 'text-amber-700', bgColor: 'bg-amber-100', label: 'Dong' },
    { color: 'text-slate-600', bgColor: 'bg-slate-200', label: 'Bac' },
    { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Vang' },
    { color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Tim' },
    { color: 'text-cyan-600', bgColor: 'bg-cyan-100', label: 'Cyan' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quan Ly Hang Thanh Vien</h2>
          <p className="text-slate-500">Tao va chinh sua cac cap bac thanh vien</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tao Hang Moi
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tim kiem hang thanh vien..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Rank Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{ranks.length}</div>
              <div className="text-sm text-slate-500">Tong so hang</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Percent className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {Math.max(...ranks.map(r => r.discountPercent))}%
              </div>
              <div className="text-sm text-slate-500">Giam gia cao nhat</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                x{Math.max(...ranks.map(r => r.pointMultiplier))}
              </div>
              <div className="text-sm text-slate-500">He so diem cao nhat</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {Math.max(...ranks.map(r => r.minPoints)).toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Diem yeu cau cao nhat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRanks.map((rank) => (
          <div
            key={rank.tier}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Rank Header */}
            <div className={`p-4 ${rank.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={rank.color}>{getTierIcon(rank.tier)}</span>
                  <span className={`font-bold text-lg ${rank.color}`}>{rank.name}</span>
                </div>
                <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                  {rank.tier}
                </span>
              </div>
            </div>

            {/* Rank Details */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900">{rank.minPoints.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">Diem toi thieu</div>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{rank.discountPercent}%</div>
                  <div className="text-xs text-slate-500">Giam gia</div>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <div className="text-lg font-bold text-amber-600">x{rank.pointMultiplier}</div>
                  <div className="text-xs text-slate-500">He so</div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Quyen loi:</h4>
                <ul className="space-y-1">
                  {rank.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                  {rank.benefits.length > 3 && (
                    <li className="text-xs text-slate-400 pl-6">
                      +{rank.benefits.length - 3} quyen loi khac
                    </li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(rank)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Sua
                </button>
                {rank.tier !== 'UNRANK' && (
                  <button
                    onClick={() => setShowDeleteConfirm(rank.tier)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRanks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Khong tim thay hang thanh vien nao.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingRank ? 'Chinh Sua Hang' : 'Tao Hang Moi'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ten hang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Vang, Bach Kim..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Min Points */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diem toi thieu
                </label>
                <input
                  type="number"
                  value={formData.minPoints}
                  onChange={(e) => setFormData({ ...formData, minPoints: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Discount Percent */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phan tram giam gia (%)
                </label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Point Multiplier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  He so nhan diem
                </label>
                <input
                  type="number"
                  value={formData.pointMultiplier}
                  onChange={(e) => setFormData({ ...formData, pointMultiplier: parseFloat(e.target.value) || 1.0 })}
                  min={1}
                  max={10}
                  step={0.1}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mau sac
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: opt.color, bgColor: opt.bgColor })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.color === opt.color
                          ? 'border-indigo-500'
                          : 'border-slate-200 hover:border-slate-300'
                      } ${opt.bgColor}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Award className={`w-4 h-4 ${opt.color}`} />
                        <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quyen loi
                </label>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        placeholder="VD: Giam gia 10% tat ca dich vu"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Them quyen loi
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 border border-slate-200 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">Xem truoc:</p>
                <div className={`p-3 rounded-lg ${formData.bgColor}`}>
                  <div className="flex items-center gap-2">
                    <Award className={`w-5 h-5 ${formData.color}`} />
                    <span className={`font-bold ${formData.color}`}>
                      {formData.name || 'Ten hang'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    {formData.minPoints.toLocaleString()} diem | {formData.discountPercent}% giam | x{formData.pointMultiplier}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Huy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingRank ? 'Cap Nhat' : 'Tao Hang'}
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
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Xac nhan xoa</h3>
              <p className="text-slate-500 mb-6">
                Ban co chac chan muon xoa hang thanh vien nay? Hanh dong nay khong the hoan tac.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Huy
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm as ExtendedLoyaltyTier)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xoa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
