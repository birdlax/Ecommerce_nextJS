// contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, loginUser as apiLoginUser, logoutUser as apiLogoutUser, registerUser as apiRegisterUser } from '../utils/authService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. State เริ่มต้นสำหรับ Server และ Client Initial Render จะเหมือนกันเสมอ
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const router = useRouter();

  const syncUserToLocalStorage = (userData) => {
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('user_profile', JSON.stringify(userData));
        console.log('[AuthContext] User profile synced to localStorage:', userData);
      } else {
        localStorage.removeItem('user_profile');
        console.log('[AuthContext] User profile removed from localStorage.');
      }
    }
  };

  // ฟังก์ชันเช็คสถานะ Auth จะถูกเรียกใน useEffect ฝั่ง client เท่านั้น
  const checkAuthStatus = useCallback(async () => {
    console.log('[AuthContext] checkAuthStatus: Starting...');

    try {
      const currentUserFromApi = await getCurrentUser();
      if (currentUserFromApi) {
        setUser(currentUserFromApi);
        setIsAuthenticated(true);
        syncUserToLocalStorage(currentUserFromApi);
        console.log('[AuthContext] checkAuthStatus: User is authenticated (verified by API):', currentUserFromApi);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        syncUserToLocalStorage(null); 
        console.log('[AuthContext] checkAuthStatus: User is NOT authenticated (verified by API).');
      }
    } catch (error) {
      console.error('[AuthContext] checkAuthStatus: Error fetching user from API:', error.message);
      setUser(null);
      setIsAuthenticated(false);
      syncUserToLocalStorage(null);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] checkAuthStatus: Finished. isLoading is now false.');
    }
  }, []); 

  useEffect(() => {
    // useEffect นี้จะรัน "หลังจาก" initial render ของ client เท่านั้น
    // ทำให้ server render และ client initial render เหมือนกัน
    // (user:null, isAuthenticated:false, isLoading:true)
    // จากนั้น client จะเรียก checkAuthStatus เพื่ออัปเดตสถานะจริงจาก API
    console.log('[AuthContext] AuthProvider useEffect (on mount), calling checkAuthStatus.');
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const userDataFromApi = await apiLoginUser({ email, password });
      // สมมติ API /login คืน user object ที่มี id, email, first_name, role ฯลฯ โดยตรง
      setUser(userDataFromApi);
      setIsAuthenticated(true);
      syncUserToLocalStorage(userDataFromApi); 
      console.log('[AuthContext] Login successful, user set:', userDataFromApi);
      return userDataFromApi;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      syncUserToLocalStorage(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const registeredUser = await apiRegisterUser(userData);
      console.log('[AuthContext] Registration successful:', registeredUser);
      return registeredUser;
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogoutUser();
    } catch (error) {
      console.error('[AuthContext] API Logout failed (continuing client-side logout):', error);
    } finally {

      setUser(null);
      setIsAuthenticated(false);
      syncUserToLocalStorage(null); 
      setIsLoading(false);
      console.log('[AuthContext] Client-side logout processed.');
      router.push('/login'); 
    }
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    checkAuthStatus 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};