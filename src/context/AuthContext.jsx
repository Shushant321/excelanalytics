import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  axios.defaults.baseURL = API_BASE_URL;

  // Set auth token in axios headers & localStorage
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Check token & fetch user on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      setAuthToken(token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      setAuthToken(token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Logout function
  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  // -----------------------------
  // Added Forgot Password function
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      return { success: false, message };
    }
  };

  // Added Reset Password function
  const resetPassword = async (token, password) => {
    try {
      await axios.post(`/auth/reset-password/${token}`, { password });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      return { success: false, message };
    }
  };
  // -----------------------------

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
