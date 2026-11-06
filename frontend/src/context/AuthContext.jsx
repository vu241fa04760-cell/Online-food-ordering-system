import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('foodie_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('foodie_token') || null);
  const [loading, setLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState(null);

  // Active delivery address
  const [currentAddress, setCurrentAddress] = useState(() => {
    const saved = localStorage.getItem('foodie_delivery_address');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const savedUser = localStorage.getItem('foodie_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.address?.street) return { ...u.address, tag: u.address.tag || 'Home' };
      } catch (e) {}
    }
    return {
      street: '452 Elm Street, Apt 3B',
      city: 'San Francisco',
      zipCode: '94103',
      phone: '+1 (555) 800-4321',
      tag: 'Home',
      coordinates: { lat: 37.7749, lng: -122.4194 },
    };
  });

  const showAuthNotice = (type, title, message) => {
    setAuthNotice({ id: Date.now(), type, title, message });
  };

  const dismissAuthNotice = () => {
    setAuthNotice(null);
  };

  // Auto-dismiss notification after 5.5s
  useEffect(() => {
    if (authNotice) {
      const timer = setTimeout(() => {
        setAuthNotice(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [authNotice]);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.data);
          localStorage.setItem('foodie_user', JSON.stringify(res.data.data));
          if (res.data.data?.address?.street) {
            setCurrentAddress((prev) => ({ ...prev, ...res.data.data.address }));
          }
        } catch (err) {
          console.warn('Profile fetch failed with current token:', err.message);
          if (err.response?.status === 401) {
            logout(false);
          }
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: authToken, ...userData } = res.data.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('foodie_token', authToken);
      localStorage.setItem('foodie_user', JSON.stringify(userData));

      showAuthNotice(
        'success',
        'Authentication Successful!',
        `Welcome back, ${userData.name}! Logged in as ${userData.role === 'admin' ? 'System Administrator' : 'Customer'}.`
      );

      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Invalid email or password.';
      showAuthNotice(
        'error',
        'Authentication Failed (Unsuccessful)',
        `Login Unsuccessful: ${errorMsg}`
      );
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const { token: authToken, ...userData } = res.data.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('foodie_token', authToken);
      localStorage.setItem('foodie_user', JSON.stringify(userData));

      showAuthNotice(
        'success',
        'Registration & Authentication Successful!',
        `Account created successfully! Welcome to FoodieFlow, ${userData.name}.`
      );

      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed.';
      showAuthNotice(
        'error',
        'Registration Unsuccessful',
        `Authentication Failed: ${errorMsg}`
      );
      throw err;
    }
  };

  const logout = (showNotice = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('foodie_token');
    localStorage.removeItem('foodie_user');

    if (showNotice) {
      showAuthNotice(
        'info',
        'Signed Out',
        'You have been logged out successfully. Guest mode is now active.'
      );
    }
  };

  const demoLogin = async (role = 'customer') => {
    const credentials =
      role === 'admin'
        ? { email: 'admin@foodie.com', password: 'admin123' }
        : { email: 'user@foodie.com', password: 'user123' };
    return await login(credentials.email, credentials.password);
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, code, newPassword });
    showAuthNotice(
      'success',
      'Password Reset Successful',
      'Your password has been updated. You can now sign in with your new credentials.'
    );
    return res.data;
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('foodie_user', JSON.stringify(updatedUser));

    try {
      const res = await api.put('/auth/profile', updates);
      if (res.data?.data) {
        const freshUser = { ...updatedUser, ...res.data.data };
        setUser(freshUser);
        localStorage.setItem('foodie_user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.warn('Sync profile to backend error:', err.message);
    }

    if (updates.avatar) {
      showAuthNotice('success', 'Profile Picture Updated!', 'Your new avatar is active across your account.');
    } else {
      showAuthNotice('success', 'Profile Updated!', 'Your account information has been updated.');
    }

    return updatedUser;
  };

  const updateDeliveryAddress = async (newAddress) => {
    setCurrentAddress(newAddress);
    localStorage.setItem('foodie_delivery_address', JSON.stringify(newAddress));

    if (user) {
      const updatedUser = { ...user, address: newAddress };
      setUser(updatedUser);
      localStorage.setItem('foodie_user', JSON.stringify(updatedUser));
      try {
        await api.put('/auth/profile', { address: newAddress });
      } catch (err) {
        console.warn('Sync address to backend notice:', err.message);
      }
    }

    showAuthNotice(
      'success',
      'Delivery Address Updated',
      `Deliver to ${newAddress.street}, ${newAddress.city || 'San Francisco'}`
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        loading,
        authNotice,
        currentAddress,
        updateDeliveryAddress,
        updateProfile,
        showAuthNotice,
        dismissAuthNotice,
        login,
        register,
        logout,
        demoLogin,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
