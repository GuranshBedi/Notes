import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTenant = localStorage.getItem('tenant');

    if (token && savedUser && savedTenant) {
      try {
        setUser(JSON.parse(savedUser));
        setTenant(JSON.parse(savedTenant));
      } catch (error) {
        console.error('Error parsing saved user/tenant data:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email }); // Debug log
      
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data); // Debug log
      
      const { token, user: userData, tenant: tenantData } = response.data;

      if (!token || !userData || !tenantData) {
        throw new Error('Invalid response format from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tenant', JSON.stringify(tenantData));

      setUser(userData);
      setTenant(tenantData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    setUser(null);
    setTenant(null);
  };

  const upgradeTenant = async () => {
    try {
      // Use tenant.id or tenant._id depending on your backend
      const tenantId = tenant.id || tenant._id;
      await api.post(`/tenants/${tenantId}/upgrade`);
      
      const updatedTenant = { ...tenant, plan: 'pro' };
      setTenant(updatedTenant);
      localStorage.setItem('tenant', JSON.stringify(updatedTenant));
      return { success: true };
    } catch (error) {
      console.error('Upgrade error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Upgrade failed' 
      };
    }
  };

  const value = {
    user,
    tenant,
    login,
    logout,
    upgradeTenant,
    isAuthenticated: !!user,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};