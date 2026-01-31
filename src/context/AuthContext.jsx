import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lockin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // If we have a token, try fetching the user
          // Note: The /me endpoint wasn't strictly in my tasks but good practice.
          // If backend doesn't have it, we might rely on localStorage user data, 
          // but for security let's try fetching or decoding.
          // For now, let's assume valid token means logged in, 
          // or ideally fetch profile.
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to load user", error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, ...userData } = res.data;
    
    localStorage.setItem('lockin_token', token);
    setToken(token);
    setUser(userData);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { token, ...userData } = res.data;
    
    localStorage.setItem('lockin_token', token);
    setToken(token);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('lockin_token');
    setToken(null);
    setUser(null);
  };

  const updateSettings = (newSettings) => {
      // Optimistic update
      setUser(prev => ({
          ...prev,
          settings: { ...prev.settings, ...newSettings }
      }));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateSettings,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
