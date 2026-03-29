import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginCredentials, LoginResponse } from '@/services/adminApi';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const isValid = await authApi.verifyToken();
        if (isValid) {
          const storedAdmin = localStorage.getItem('adminData');
          if (storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
          } else {
            const res = await authApi.getAdminProfile();
            const adminProfile = res?.admin || res?.data?.admin || res?.data || null;
            if (adminProfile) {
              setAdmin(adminProfile);
              localStorage.setItem('adminData', JSON.stringify(adminProfile));
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await authApi.login(credentials);
    
    if (response.success && response.admin) {
      setAdmin(response.admin);
      localStorage.setItem('adminData', JSON.stringify(response.admin));
    }
    
    return response;
  };

  const logout = async () => {
    await authApi.logout();
    setAdmin(null);
    localStorage.removeItem('adminData');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
