import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, isAuthenticated, getCachedUser, getCurrentUser, loginUser, logoutUser, LoginCredentials, registerUser, RegisterData } from '../api/users';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}

const defaultContext: AuthContextType = {
  isLoggedIn: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  register: async () => {}
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage or API on app initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isAuthenticated()) {
          // First try to get user from cache for faster UI loading
          const cachedUser = getCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
            setIsLoggedIn(true);
          }
          
          // Then refresh from API
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setIsLoggedIn(true);
          } catch (error) {
            // If API call fails, logout user
            logoutUser();
            setIsLoggedIn(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await loginUser(credentials);
      const user = await getCurrentUser();
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      setError('Invalid credentials. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setIsLoggedIn(false);
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(userData);
      // Login after successful registration
      await login({ 
        username: userData.email, 
        password: userData.password 
      });
    } catch (error) {
      setError('Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        error,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};