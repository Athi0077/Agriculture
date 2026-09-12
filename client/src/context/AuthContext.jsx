import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, signup as apiSignup } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    const data = await apiLogin(userData);
    if (data.success) {
      const userToStore = {
        ...data.user,
        token: data.token
      };
      setCurrentUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
    }
    return data;
  };

  const signup = async (userData) => {
    const data = await apiSignup(userData);
    if (data.success) {
      const userToStore = {
        ...data.user,
        token: data.token
      };
      setCurrentUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
    }
    return data;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const updateUserSettings = async (userData) => {
    const { updateSettings } = await import('../services/api');
    const data = await updateSettings(userData);
    if (data.success) {
      const userToStore = {
        ...data.user,
        token: currentUser.token // preserve token
      };
      setCurrentUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
    }
    return data;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateUserSettings,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
