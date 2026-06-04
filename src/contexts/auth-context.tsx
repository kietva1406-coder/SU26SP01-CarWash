'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, CustomerVehicle } from '@/lib/types';
import { MOCK_USERS, MOCK_CUSTOMER_VEHICLES } from '@/lib/mock-data';
import { getPermissions, Permission } from '@/lib/permissions';

interface AuthContextType {
  user: User | null;
  permissions: Permission | null;
  login: (role: UserRole) => void;
  loginWithCredentials: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, plateNumber: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    // Find a user with the specified role (BR-A54: uses unique customer ID)
    const foundUser = MOCK_USERS.find((u) => u.role === role);
    if (foundUser) {
      setUser(foundUser);
    }
  };

  const loginWithCredentials = (email: string, password: string): { success: boolean; error?: string } => {
    // Find user by email
    const foundUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'Email khong ton tai trong he thong' };
    }
    
    if (foundUser.password !== password) {
      return { success: false, error: 'Mat khau khong chinh xac' };
    }
    
    setUser(foundUser);
    return { success: true };
  };

  const register = (name: string, email: string, password: string, plateNumber: string): { success: boolean; error?: string } => {
    // Check if email already exists
    const emailExists = MOCK_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, error: 'Email da ton tai trong he thong' };
    }

    // Create new customer user
    const newUserId = `USR${String(MOCK_USERS.length + 1).padStart(3, '0')}`;
    const newUser: User = {
      id: newUserId,
      name,
      email,
      password,
      role: 'customer',
      phone: '',
      plateNumber,
    };

    // Add to mock users
    MOCK_USERS.push(newUser);
    
    // Create and add primary vehicle for the new customer
    const newVehicle: CustomerVehicle = {
      id: `VH${String(MOCK_CUSTOMER_VEHICLES.length + 1).padStart(3, '0')}`,
      customerId: newUserId,
      plateNumber,
      vehicleType: 'sedan', // Default vehicle type
      isPrimary: true, // Set as primary/default
      createdAt: new Date().toISOString(),
    };
    MOCK_CUSTOMER_VEHICLES.push(newVehicle);
    
    // Auto-login after registration
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  const permissions = user ? getPermissions(user.role) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        login,
        loginWithCredentials,
        register,
        logout,
        switchRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
