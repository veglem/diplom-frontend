import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { writerService } from '../services/writerService';
import { Writer, Post } from '../types/user';
import { useNotification } from './NotificationContext';

interface WriterContextType {
  writer: Writer | null;
  postIds: string[];
  followersCount: number;
  isLoading: boolean;
  isCurrentUserWriter: boolean;
  isFollowing: boolean;
  updateWriterProfile: (data: { name?: string; description?: string }) => Promise<void>;
  updateWriterAvatar: (file: File) => Promise<void>;
  updateWriterCover: (file: File) => Promise<void>;
  updateWriterGoal: (aim: string, moneyNeeded: number) => Promise<void>;
  createPost: (title: string, content: string, attachments?: File[]) => Promise<string>;
  refreshPosts: () => Promise<void>;
  followWriter: () => Promise<void>;
  unfollowWriter: () => Promise<void>;
}

interface WriterProviderProps {
  writerId: string;
  children: React.ReactNode;
}

export const WriterContext = createContext<WriterContextType | null>(null);

export const WriterProvider: React.FC<WriterProviderProps> = ({ writerId, children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [writer, setWriter] = useState<Writer | null>(null);
  const [postIds, setPostIds] = useState<string[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUserWriter, setIsCurrentUserWriter] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Загрузка данных писателя и его постов
  useEffect(() => {
    const loadWriterData = async () => {
      setIsLoading(true);
      try {
        // Загружаем профиль писателя
        const writerData = await writerService.getWriterProfile(writerId);
        if (writerData) {
          setWriter(writerData);
          
          // Проверяем, является ли текущий пользователь этим писателем
          setIsCurrentUserWriter(user?.id === writerData.id);
          
          // Загружаем ID постов писателя
          const postIds = await writerService.getWriterPostIds(writerId);
          setPostIds(postIds);
          
          // Загружаем количество подписчиков
          const followersCount = await writerService.getFollowersCount(writerId);
          setFollowersCount(followersCount);
          
          // Проверяем, подписан ли текущий пользователь на писателя
          if (user?.id) {
            const isFollowing = await writerService.isFollowing(user.id, writerId);
            setIsFollowing(isFollowing);
          }
        } else {
          showNotification('Писатель не найден', 'error');
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных писателя:', error);
        showNotification('Ошибка при загрузке данных писателя', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadWriterData();
  }, [writerId, user?.id, showNotification]);

  // Обновление профиля писателя
  const updateWriterProfile = async (data: { name?: string; description?: string }) => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для редактирования этого профиля', 'error');
      return;
    }

    try {
      await writerService.updateWriterProfile(writerId, data);
      
      // Обновляем локальные данные
      if (writer) {
        setWriter({
          ...writer,
          username: data.name || writer.username,
          bio: data.description || writer.bio
        });
      }
      
      showNotification('Профиль успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      showNotification('Ошибка при обновлении профиля', 'error');
    }
  };

  // Обновление аватара писателя
  const updateWriterAvatar = async (file: File) => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для редактирования этого профиля', 'error');
      return;
    }

    try {
      const avatarUrl = await writerService.updateWriterAvatar(writerId, file);
      
      // Обновляем локальные данные
      if (writer) {
        setWriter({
          ...writer,
          avatar: avatarUrl
        });
      }
      
      showNotification('Аватар успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      showNotification('Ошибка при обновлении аватара', 'error');
    }
  };

  // Обновление обложки профиля писателя
  const updateWriterCover = async (file: File) => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для редактирования этого профиля', 'error');
      return;
    }

    try {
      await writerService.updateWriterCover(writerId, file);
      showNotification('Обложка профиля успешно обновлена', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении обложки профиля:', error);
      showNotification('Ошибка при обновлении обложки профиля', 'error');
    }
  };

  // Обновление цели финансирования
  const updateWriterGoal = async (aim: string, moneyNeeded: number) => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для редактирования этого профиля', 'error');
      return;
    }

    try {
      await writerService.updateWriterGoal(writerId, aim, moneyNeeded);
      
      // Обновляем локальные данные
      if (writer) {
        setWriter({
          ...writer,
          goal: {
            ...writer.goal,
            target: moneyNeeded
          }
        });
      }
      
      showNotification('Цель финансирования успешно обновлена', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении цели финансирования:', error);
      showNotification('Ошибка при обновлении цели финансирования', 'error');
    }
  };

  // Создание нового поста
  const createPost = async (title: string, content: string, attachments: File[] = []): Promise<string> => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для создания постов от имени этого писателя', 'error');
      return '';
    }

    try {
      const postId = await writerService.createPost(writerId, title, content, attachments);
      
      // Обновляем список постов
      await refreshPosts();
      
      showNotification('Пост успешно создан', 'success');
      return postId;
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
      showNotification('Ошибка при создании поста', 'error');
      return '';
    }
  };

  // Обновление списка постов
  const refreshPosts = async () => {
    try {
      const postIds = await writerService.getWriterPostIds(writerId);
      setPostIds(postIds);
    } catch (error) {
      console.error('Ошибка при обновлении списка постов:', error);
      showNotification('Ошибка при обновлении списка постов', 'error');
    }
  };

  // Подписаться на писателя
  const followWriter = async () => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы подписаться на писателя', 'error');
      return;
    }

    if (isCurrentUserWriter) {
      showNotification('Вы не можете подписаться на себя', 'error');
      return;
    }

    try {
      await writerService.followWriter(user.id, writerId);
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      showNotification('Вы успешно подписались на писателя', 'success');
    } catch (error) {
      console.error('Ошибка при подписке на писателя:', error);
      showNotification('Ошибка при подписке на писателя', 'error');
    }
  };

  // Отписаться от писателя
  const unfollowWriter = async () => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы отписаться от писателя', 'error');
      return;
    }

    try {
      await writerService.unfollowWriter(user.id, writerId);
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
      showNotification('Вы успешно отписались от писателя', 'success');
    } catch (error) {
      console.error('Ошибка при отписке от писателя:', error);
      showNotification('Ошибка при отписке от писателя', 'error');
    }
  };

  return (
    <WriterContext.Provider
      value={{
        writer,
        postIds,
        followersCount,
        isLoading,
        isCurrentUserWriter,
        isFollowing,
        updateWriterProfile,
        updateWriterAvatar,
        updateWriterCover,
        updateWriterGoal,
        createPost,
        refreshPosts,
        followWriter,
        unfollowWriter
      }}
    >
      {children}
    </WriterContext.Provider>
  );
};

export const useWriter = () => {
  const context = useContext(WriterContext);
  if (!context) {
    throw new Error('useWriter must be used within a WriterProvider');
  }
  return context;
};
