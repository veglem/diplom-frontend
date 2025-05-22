import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    login: string;
    avatar?: string;
    isAuthor?: boolean;
  } | null;
  login: (login: string, password: string) => Promise<boolean>;
  register: (login: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: { username?: string; login?: string; avatar?: string; isAuthor?: boolean }) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  useEffect(() => {
    // Проверяем сохраненную сессию при загрузке
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      const userProfile = db.userProfile(savedUserId);
      if (userProfile) {
        setUser({
          id: savedUserId,
          username: userProfile.display_name,
          login: userProfile.login,
          avatar: userProfile.profile_photo,
        });
        setIsAuthenticated(true);
      }
    }
  }, []);

  const login = async (login: string, password: string): Promise<boolean> => {
    const userDetails = db.userAccessDetails(login);
    if (userDetails && userDetails.password_hash === password) { // В реальном приложении здесь должно быть сравнение хешей
      const userProfile = db.userProfile(userDetails.user_id);
      if (userProfile) {
        const creator = db.checkIfCreator(userDetails.user_id);
        setUser({
          id: userDetails.user_id,
          username: userProfile.display_name,
          login: userProfile.login,
          avatar: userProfile.profile_photo,
          isAuthor: !!creator,
        });
        setIsAuthenticated(true);
        localStorage.setItem('userId', userDetails.user_id);
        return true;
      }
    }
    return false;
  };

  const register = async (login: string, username: string, password: string): Promise<boolean> => {
    // Проверяем, существует ли пользователь
    const existingUser = db.userAccessDetails(login);
    if (existingUser) {
      return false;
    }

    // Создаем нового пользователя
    const userId = Math.random().toString(36).substr(2, 9); // В реальном приложении использовать UUID
    const result = db.addUser(userId, login, username, undefined, password); // В реальном приложении хешировать пароль
    
    if (result.user_id) {
      const creator = db.checkIfCreator(userId);
      setUser({
        id: userId,
        username,
        login,
        avatar: undefined,
        isAuthor: !!creator,
      });
      setIsAuthenticated(true);
      localStorage.setItem('userId', userId);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('userId');
  };

  const updateUser = (data: { username?: string; login?: string; avatar?: string; isAuthor?: boolean }) => {
    if (user) {
      setUser({
        ...user,
        ...data
      });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
