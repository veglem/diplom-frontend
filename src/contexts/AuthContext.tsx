import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { NotificationSettings, UserData } from '../types/user';
import { UserService } from '../services/userService';
import { writerService } from '../services/writerService';
import { api } from '../utils/api';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  selfAuthorId: string | null;
  isLoading: boolean
  login: (login: string, password: string) => Promise<boolean>;
  register: (login: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: { username?: string; login?: string; avatar?: string; isAuthor?: boolean, notificationSettings?: NotificationSettings }) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  becomeAuthor: (name: string, description: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  selfAuthorId: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  updateUser: async () => {},
  updatePassword: async () => {},
  updateAvatar: async () => {},
  becomeAuthor: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [selfAuthorId, setSelfAuthorId] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const func = async () => {
      try {
        setIsLoading(true)
        const userData = await api.getProfile();
        setUser({
          id: userData.name,
          login: userData.login,
          username: userData.name,
          avatar: userData.profile_photo,
          isAuthor: userData.is_creator,
          notificationSettings: {
            newPosts: false,
            news: false,
            commentLikes: false,
            commentReplies: false
          }
        })
        if (userData.is_creator) {
          setSelfAuthorId(userData.creator_id)
        }
        setIsAuthenticated(true)
        console.log(userData);
      } catch(e) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    func();
    
  }, []);

  const login = async (login: string, password: string): Promise<boolean> => {
    try {
      await api.signIn({login: login, password_hash: password});
      const userData = await api.getProfile();
      setUser({
        id: userData.name,
        login: userData.login,
        username: userData.name,
        avatar: userData.profile_photo,
        isAuthor: userData.is_creator,
        notificationSettings: {
          newPosts: false,
          news: false,
          commentLikes: false,
          commentReplies: false
        }
      })
      if (userData.is_creator) {
        setSelfAuthorId(userData.creator_id)
      }
      setIsAuthenticated(true)
      return true
    } catch(e) {
      showNotification((e as Error).message, 'error')
      return false
    }
  };

  const register = async (login: string, username: string, password: string): Promise<boolean> => {
    try {
      await api.signUp({login: login, password_hash: password, name: username})
      const userData = await api.getProfile();
      setUser({
        id: userData.login,
        login: userData.login,
        username: userData.name,
        avatar: userData.profile_photo,
        isAuthor: userData.is_creator,
        notificationSettings: {
          newPosts: false,
          news: false,
          commentLikes: false,
          commentReplies: false
        }
      })
      if (userData.is_creator) {
        setSelfAuthorId(userData.creator_id)
      }
      setIsAuthenticated(true)
      return true
    } catch (e) {
      showNotification((e as Error).message, 'error')
      return false
    }
  };

  const logout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setSelfAuthorId(null);
    setUser(null);
  };

  const updateUser = async (data: { username?: string; login?: string; avatar?: string; isAuthor?: boolean, notificationSettings?: NotificationSettings }) => {
    if (user != null) {
      try {
        await api.updateUserData({
          login: data.login ?? user.login,
          name: data.username ?? user.username,
        });
        setUser({
          ...user,
          login: data.login ?? user.login,
          username: data.username ?? user.username,
        });
      } catch(e) {
        showNotification((e as Error).message, 'error')
      }
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await api.updatePassword({old_password: oldPassword, new_password: newPassword})
    } catch (e) {
      showNotification((e as Error).message, 'error');
    }
  }

  const updateAvatar = async (file: File) => {
    try {
      if (user != null) {
        const avatar = await api.updateProfilePhoto(file, user?.avatar ?? '00000000-0000-0000-0000-000000000000')
        setUser({
          ...user,
          avatar: avatar
        })
      }
    } catch (e) {
      showNotification((e as Error).message, 'error');
    }
  }

  const becomeAuthor = async (name: string, description: string) => {
    if (user?.id && !user.isAuthor) {
      const authorId = await api.becameCreator({name: name, description: description});
      updateUser({
        ...user,
        isAuthor: true
      })
      setSelfAuthorId(authorId);
    }
  }
  console.log({ isAuthenticated, user, selfAuthorId })
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, selfAuthorId, isLoading, login, register, logout, updateUser, updatePassword, updateAvatar, becomeAuthor }}>
      {children}
    </AuthContext.Provider>
  );
};
