import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../js/config';

const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const loadingRef = useRef(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      checkAuth(storedToken, JSON.parse(storedUser)).finally(() => {
        loadingRef.current = false;
      });
    } else {
      loadingRef.current = false;
    }
    /* if (storedToken) {
      checkAuth(storedToken);
    } */
  }, []);


  const checkAuth = async (token, user) => {
    try {
      /* console.log('Checking auth with token:', token);
      console.log('User data:', user); */

      if (!user || typeof user !== 'object') {
        console.error('User object is undefined or not an object');
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      if (!user.id) {
        console.error('User object is missing id field');
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      const response = await axios.post(`${API_URL}main/token/check`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      /* console.log('Token check response:', response.data); */

      if (response.status === 200 && response.data.status === 'success') {
        setIsAuthenticated(true);
        setToken(token);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const login = async (newToken, newUser) => {
    try {
      console.log('Logging in with token:', newToken);
      console.log('User data:', newUser);

      if (newUser && newUser.id) {
        await checkAuth(newToken, newUser);
      } else {
        console.error('User object is missing id or other required fields');
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
    }
  };

  /* const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    // Сохранение токена в localStorage
    localStorage.setItem('token', newToken);
  }; */

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // Удаление токена из localStorage
    localStorage.removeItem('token');
    window.location.href = "/";
  };
  

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout, isLoading: loadingRef.current }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);