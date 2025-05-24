import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../utils/db';
import { NotificationSettings, UserData } from '../types/user';
import { UserService } from '../services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
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

  useEffect(() => {
    // Проверяем сохраненную сессию при загрузке
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      const userProfile = db.userProfile(savedUserId);
      const newPosts = localStorage.getItem('newPosts') == "true";
      const news = localStorage.getItem('news') == "true";
      const commentReplies = localStorage.getItem('commentReplies') == "true";
      const commentLikes = localStorage.getItem('commentLikes') == "true";
      if (userProfile) {
        setUser({
          id: savedUserId,
          username: userProfile.display_name,
          login: userProfile.login,
          avatar: userProfile.profile_photo,
          notificationSettings: {
            newPosts: newPosts,
            news: news,
            commentLikes: commentLikes,
            commentReplies: commentReplies
          }
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
        const newPosts = localStorage.getItem('newPosts') == "true";
        const news = localStorage.getItem('news') == "true";
        const commentReplies = localStorage.getItem('commentReplies') == "true";
        const commentLikes = localStorage.getItem('commentLikes') == "true";
        setUser({
          id: userDetails.user_id,
          username: userProfile.display_name,
          login: userProfile.login,
          avatar: userProfile.profile_photo,
          isAuthor: !!creator,
          notificationSettings: {
            newPosts: newPosts,
            news: news,
            commentLikes: commentLikes,
            commentReplies: commentReplies
          }
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
      const newPosts = localStorage.getItem('newPosts') == "true";
      const news = localStorage.getItem('news') == "true";
      const commentReplies = localStorage.getItem('commentReplies') == "true";
      const commentLikes = localStorage.getItem('commentLikes') == "true";
      setUser({
        id: userId,
        username,
        login,
        avatar: undefined,
        isAuthor: !!creator,
        notificationSettings: {
          newPosts: newPosts,
          news: news,
          commentLikes: commentLikes,
          commentReplies: commentReplies
        }
      });
      setIsAuthenticated(true);
      localStorage.setItem('userId', userId);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('userId');
  };

  const updateUser = async (data: { username?: string; login?: string; avatar?: string; isAuthor?: boolean, notificationSettings?: NotificationSettings }) => {
    if (user) {
      console.log("user context updated")
      if (data.notificationSettings) {
        localStorage.setItem("newPosts", data.notificationSettings.newPosts ? "true" : "false")
        localStorage.setItem("news", data.notificationSettings.news ? "true" : "false");
        localStorage.setItem("commentReplies", data.notificationSettings.commentReplies ? "true" : "false")
        localStorage.setItem("commentLikes", data.notificationSettings.commentLikes ? "true" : "false")
        setUser({
          ...user,
          notificationSettings: {...data.notificationSettings}
        })
      }
      console.log(data)
      setUser({
        ...user,
        ...data
      });
    }
    console.log(user)
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    if (user?.id) {
      UserService.changePassword(user?.id, oldPassword, newPassword)
    } else {
      throw Error("User not auntheficated");
    }
  }

  const updateAvatar = async (file: File) => {
    if (user?.id) {
      const url = await UserService.updateUserAvatar(user?.id, file)
      updateUser({
        ...user,
        avatar: url
      })
    }
  }

  const becomeAuthor = async (name: string, description: string) => {
    if (user?.id && !user.isAuthor) {
      UserService.becomeCreator(user.id, name, description)
      updateUser({
        ...user,
        isAuthor: true
      })
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, updateUser, updatePassword, updateAvatar, becomeAuthor }}>
      {children}
    </AuthContext.Provider>
  );
};
