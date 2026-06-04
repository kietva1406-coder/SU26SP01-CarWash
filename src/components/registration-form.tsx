'use client';

import { useState } from 'react';
import { Mail, Lock, User, Car, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface RegistrationFormProps {
  onRegistrationSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegistrationForm({ onRegistrationSuccess, onSwitchToLogin }: RegistrationFormProps) {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validate form inputs
  const validateForm = () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên');
      return false;
    }

    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return false;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    if (!plateNumber.trim()) {
      setError('Vui lòng nhập biển số xe');
      return false;
    }

    return true;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const result = register(name, email, password, plateNumber);
      
      if (!result.success) {
        setError(result.error || 'Đăng ký thất bại');
        setIsLoading(false);
      } else {
        // Show success message
        setShowSuccess(true);
        setIsLoading(false);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          if (onRegistrationSuccess) {
            onRegistrationSuccess();
          }
        }, 2000);
      }
    }, 500);
  };

  if (showSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-100 rounded-full p-4 w-fit mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Đăng ký thành công!</h3>
        <p className="text-slate-600">Chào mừng <span className="font-semibold">{name}</span></p>
        <p className="text-sm text-slate-500">Hệ thống đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Họ và tên
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên của bạn"
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
          />
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
          />
        </div>
      </div>

      {/* Plate Number Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Biển số xe
        </label>
        <div className="relative">
          <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            placeholder="VD: 29A-12345"
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
            required
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Register Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Đăng ký'
        )}
      </button>

      {/* Switch to Login */}
      <div className="text-center">
        <span className="text-sm text-slate-600">Đã có tài khoản? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Đăng nhập
        </button>
      </div>
    </form>
  );
}
