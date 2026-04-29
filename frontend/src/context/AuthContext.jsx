import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on initial load
    const token = localStorage.getItem('token');
    const storedUserStr = localStorage.getItem('user');

    if (token && storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        // If the stored user is missing 'id', force re-login (stale session)
        if (!storedUser.id) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setUser(storedUser);
        }
      } catch (e) {
        // invalid JSON
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (rollNo, password) => {
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { rollNo, password });

      const { token, id, role, name, year, isAppBlocked, isSwapBlocked } = res.data;

      const userData = { id, rollNo, role, name, year, isAppBlocked, isSwapBlocked };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, role };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, rollNo, password, year, role = 'student', adminSecret = '') => {
    try {
      await axios.post('http://localhost:5001/api/auth/register', { name, rollNo, password, year, role, adminSecret });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);