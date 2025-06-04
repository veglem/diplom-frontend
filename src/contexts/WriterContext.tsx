import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { writerService } from '../services/writerService';
import { Writer, Post } from '../types/user';
import { useNotification } from './NotificationContext';
import { translationService } from '../utils/translate';
import { useLanguage } from './LanguageContext';

// Интерфейс для уровня подписки
export interface SubscriptionLevel {
  id: string;
  title: string;
  price: string;
  description: string;
  is_avalible: boolean
}

interface WriterContextType {
  writer: Writer | null;
  postIds: string[];
  followersCount: number;
  isLoading: boolean;
  isCurrentUserWriter: boolean;
  isFollowing: boolean;
  subscriptionLevels: SubscriptionLevel[];
  translating: boolean | undefined;
  updateWriterProfile: (data: { name?: string; description?: string }) => Promise<void>;
  updateWriterAvatar: (file: File) => Promise<void>;
  updateWriterCover: (file: File) => Promise<void>;
  updateWriterGoal: (aim: string, moneyNeeded: number) => Promise<void>;
  createPost: (title: string, content: string, attachments?: File[], subscriptionIds?: string[]) => Promise<string>;
  refreshPosts: () => Promise<void>;
  followWriter: () => Promise<void>;
  unfollowWriter: () => Promise<void>;
  createSubscriptionLevel: (title: string, price: number, description: string) => Promise<void>;
  updateSubscriptionLevel: (id: string, title: string, price: number, description: string) => Promise<void>;
  deleteSubscriptionLevel: (id: string) => Promise<void>;
  subscribeToLevel: (subscriptionId: string, months: number) => Promise<void>;
  refreshSubscriptionLevels: () => Promise<void>;
  setTranslating: (translating: boolean | undefined) => void;
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
  const [subscriptionLevels, setSubscriptionLevels] = useState<SubscriptionLevel[]>([]);
  const [translating, setTranslating] = useState<boolean | undefined>(undefined);
  const {langCode} = useLanguage();

  // Загрузка данных писателя и его постов
  useEffect(() => {
    const loadWriterData = async () => {
      setIsLoading(true);
      try {
        // Загружаем профиль писателя
        const writerData = await writerService.getWriterProfile(writerId);
        if (writerData) {
          if (writerData.isMyPage || translating !== true) {
            setWriter(writerData);
          } else {
            if (writerData.goal.aim != undefined && writer?.goal.aim?.trim().length != 0) {
              const trunslationRes = await translationService.autoTranslate(langCode, writerData.bio, writerData.goal.aim) 
              setWriter({
                ...writerData,
                bio: trunslationRes[0],
                goal: {
                  ...writerData.goal,
                  aim: trunslationRes[1]
                }
              })
            } else {
              const trunslationRes = await translationService.autoTranslate(langCode, writerData.bio) 
              setWriter({
                ...writerData,
                bio: trunslationRes[0]
              })
            }
          }
          
          
          // Проверяем, является ли текущий пользователь этим писателем
          await setIsCurrentUserWriter(writerData.isMyPage ?? false);
          
          // Загружаем ID постов писателя
          const postIds = await writerService.getWriterPostIds(writerId);
          setPostIds(postIds);
          
          // Загружаем количество подписчиков
          const followersCount = await writerService.getFollowersCount(writerId);
          setFollowersCount(followersCount);
          
          // Загружаем уровни подписки
          await refreshSubscriptionLevels();
          
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
  }, [writerId, user?.id, showNotification, translating]);

  // Обновление профиля писателя
  const updateWriterProfile = async (data: { name?: string; description?: string }) => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для редактирования этого профиля', 'error');
      return;
    }

    try {
      if (writer) {
        await writerService.updateWriterProfile(writerId, {
         name: data.name ?? writer?.username,
         description: data.description ?? writer?.bio
      });
      }
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
          profilePhoto: avatarUrl
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
      const url = await writerService.updateWriterCover(writerId, file);
      if (writer) {
        setWriter({
        ...writer,
        coverPhoto: url
      })
      }
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
            aim: aim == '' ? undefined : aim,
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
  const createPost = async (title: string, content: string, attachments: File[] = [], subscriptionIds: string[] = []): Promise<string> => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для создания постов от имени этого писателя', 'error');
      return '';
    }

    try {
      const postId = await writerService.createPost(writerId, title, content, attachments, subscriptionIds);
      
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

  // Обновление списка уровней подписки
  const refreshSubscriptionLevels = async () => {
    try {
      const levels = await writerService.getCreatorSubscriptions(writerId);
      const isMyPage = (await writerService.getWriterProfile(writerId))?.isMyPage

      if (isMyPage) {
        console.log("MY PAGE")
        setSubscriptionLevels(levels);
      } else {
        console.log("NOT MY PAGE")
        const translationRes = await translationService.autoTranslate(langCode, ...levels.flatMap(level => {
          if (level.description == '') {
            return [level.title, "Описания нет"]
          } else {
            return [level.title, level.description]
          }
        }))
        setSubscriptionLevels(
          levels.map((level, index) => ({
            ...level,
            title: translationRes[2 * index],
            description: translationRes[2 * index + 1]
          }))
        )
      }
      

      
    } catch (error) {
      console.error('Ошибка при загрузке уровней подписки:', error);
      showNotification('Ошибка при загрузке уровней подписки', 'error');
    }
  };

  // Создание нового уровня подписки
  const createSubscriptionLevel = async (title: string, price: number, description: string) => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для создания уровней подписки', 'error');
      return;
    }

    try {
      await writerService.createSubscription(writerId, title, price, description);
      await refreshSubscriptionLevels();
      showNotification('Уровень подписки успешно создан', 'success');
    } catch (error) {
      console.error('Ошибка при создании уровня подписки:', error);
      showNotification('Ошибка при создании уровня подписки', 'error');
    }
  };

  // Обновление уровня подписки
  const updateSubscriptionLevel = async (id: string, title: string, price: number, description: string) => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для редактирования уровней подписки', 'error');
      return;
    }

    try {
      await writerService.updateSubscription(id, title, price, description, writerId);
      await refreshSubscriptionLevels();
      showNotification('Уровень подписки успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении уровня подписки:', error);
      showNotification('Ошибка при обновлении уровня подписки', 'error');
    }
  };

  // Удаление уровня подписки
  const deleteSubscriptionLevel = async (id: string) => {
    if (!isCurrentUserWriter) {
      showNotification('У вас нет прав для удаления уровней подписки', 'error');
      return;
    }

    try {
      await writerService.deleteSubscription(writerId, id);
      await refreshSubscriptionLevels();
      showNotification('Уровень подписки успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении уровня подписки:', error);
      showNotification('Ошибка при удалении уровня подписки', 'error');
    }
  };

  // Подписка на уровень
  const subscribeToLevel = async (subscriptionId: string, months: number) => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы подписаться', 'error');
      return;
    }

    if (isCurrentUserWriter) {
      showNotification('Вы не можете подписаться на свой собственный контент', 'error');
      return;
    }

    try {
      const price = (await writerService.getCreatorSubscriptions(writerId)).find(sub => sub.id == subscriptionId)?.price
      await writerService.subscribeToLevel(user.id, subscriptionId, months, writerId, price);
      refreshSubscriptionLevels();
      refreshPosts();
      showNotification('Вы успешно подписались', 'success');
    } catch (error) {
      console.error('Ошибка при подписке:', error);
      showNotification('Ошибка при подписке', 'error');
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
        subscriptionLevels,
        translating,
        updateWriterProfile,
        updateWriterAvatar,
        updateWriterCover,
        updateWriterGoal,
        createPost,
        refreshPosts,
        followWriter,
        unfollowWriter,
        createSubscriptionLevel,
        updateSubscriptionLevel,
        deleteSubscriptionLevel,
        subscribeToLevel,
        refreshSubscriptionLevels,
        setTranslating
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
