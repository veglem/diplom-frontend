import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { writerService } from '../services/writerService';
import { Post } from '../types/user';
import { useNotification } from './NotificationContext';
import { WriterContext } from './WriterContext';
import { useLanguage } from './LanguageContext';
import { htmlTranslator } from '../utils/htmlTranslator';
import { translationService } from '../utils/translate';


// Интерфейс для комментария
export interface Comment {
  comment_id: string;
  user_id: string;
  display_name: string;
  profile_photo?: string;
  post_id: string;
  comment_text: string;
  creation_date: Date;
  likes_count: number;
}

interface PostContextType {
  post: Post | null;
  attachmentIds: {id: string, type: string}[];
  commentIds: string[];
  comments: Comment[];
  isLoading: boolean;
  isCurrentUserAuthor: boolean;
  isPostAvailable: boolean;
  isLiked: boolean;
  updatePost: (title: string, content: string, attachments: File[], subscriptionsIds: string[]) => Promise<void>;
  deletePost: () => Promise<void>;
  refreshAttachments: () => Promise<void>;
  refreshComments: () => Promise<void>;
  likePost: () => Promise<void>;
  unlikePost: () => Promise<void>;
  addComment: (text: string) => Promise<string>;
  editComment: (commentId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  isCommentLiked: (commentId: string) => Promise<boolean>;
  isCommentAuthor: (commentId: string) => Promise<boolean>;
}

interface PostProviderProps {
  postId: string;
  children: React.ReactNode;
}

const PostContext = createContext<PostContextType | null>(null);

export const PostProvider: React.FC<PostProviderProps> = ({ postId, children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const writerContext = useContext(WriterContext);
  
  const [post, setPost] = useState<Post | null>(null);
  const [attachmentIds, setAttachmentIds] = useState<{id: string, type: string}[]>([]);
  const [commentIds, setCommentIds] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUserAuthor, setIsCurrentUserAuthor] = useState(false);
  const [isPostAvailable, setIsPostAvailable] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const {langCode} = useLanguage();

  const translating = writerContext?.translating;

  console.log(post)

  // Загрузка данных поста
  useEffect(() => {
    const loadPostData = async () => {
      setIsLoading(true);
      try {
        // Получаем данные поста
        const postData = await writerService.getPost(postId);
        if (postData) {
          // Проверяем, является ли текущий пользователь автором поста
          if (user?.id) {
            const isAuthor = await writerService.isPostAuthor(user.id, postId);
            setIsCurrentUserAuthor(isAuthor);
            
            // Проверяем, поставил ли пользователь лайк посту
            const liked = await writerService.isPostLiked(user.id, postId);
            setIsLiked(liked);
            
            // Если пользователь автор, то пост всегда доступен
            if (isAuthor) {
              setIsPostAvailable(true);
              setPost(postData);
              
              // Загружаем атачи и комментарии
              await refreshAttachments();
              await refreshComments();
            } else {
              // Проверяем, доступен ли пост для текущего пользователя
              const available = await writerService.isPostAvailable(user.id, postId);
              setIsPostAvailable(available);
              
              // Если пост доступен, загружаем полные данные и атачи/комментарии
              if (available) {
                if (writerContext?.translating == true) {
                  const translatedContent = await htmlTranslator.translateHtml(postData.content, langCode)
                  const translatedTitle = await translationService.autoTranslate(langCode, postData.title)
                  setPost({
                    ...postData,
                    title: translatedTitle[0],
                    content: translatedContent
                  });
                } else {
                  setPost(postData)
                }
                await refreshAttachments();
                await refreshComments();
              } else {
                // Если пост недоступен, то показываем только заголовок
                setPost({
                  id: postData.id,
                  title: postData.title,
                  content: '', // Скрываем содержимое
                  authorId: postData.authorId,
                  likes_count: postData.likes_count,
                  is_avalible: postData.is_avalible,
                  subscriptions: postData.subscriptions
                });
              }
            }
          } else {
            // Если пользователь не авторизован, то пост недоступен
            setIsPostAvailable(false);
            setPost({
              id: postData.id,
              title: postData.title,
              content: '', // Скрываем содержимое
              authorId: postData.authorId,
              likes_count: postData.likes_count,
              is_avalible: postData.is_avalible,
              subscriptions: postData.subscriptions
            });
          }
        } else {
          showNotification('Пост не найден', 'error');
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных поста:', error);
        showNotification('Ошибка при загрузке данных поста', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadPostData();
  }, [postId, user?.id, showNotification, translating]);

  // Обновление списка атачей
  const refreshAttachments = async () => {
    try {
      const attachIds = await writerService.getPostAttachmentIds(postId);
      setAttachmentIds(attachIds);
    } catch (error) {
      console.error('Ошибка при загрузке атачей:', error);
    }
  };

  // Обновление списка комментариев
  const refreshComments = async () => {
    try {
      const commentIds = await writerService.getPostCommentIds(postId);
      setCommentIds(commentIds);
      
      // Получаем полную информацию о комментариях
      const commentsData = await writerService.getPostComments(postId);
      let commentsTranslations: string[];
      if (writerContext?.translating == true) {
        commentsTranslations = await translationService.autoTranslate(langCode, ...commentsData.map(val => (val.comment_text)))
      } else {
        commentsTranslations = commentsData.map(val => (val.comment_text))
      }
      
      setComments(commentsData.map((comment, index) => {
        if (user?.username == comment.display_name) {
          return comment;
        }
        return ({
        ...comment,
        comment_text: commentsTranslations[index]
      })}) as Comment[]);
    } catch (error) {
      console.error('Ошибка при загрузке комментариев:', error);
    }
  };

  // Обновление поста
  const updatePost = async (title: string, content: string, attachments: File[], subscriptionsIds: string[]) => {
    if (!isCurrentUserAuthor) {
      showNotification('У вас нет прав для редактирования этого поста', 'error');
      return;
    }

    try {
      await writerService.updatePost(postId, title, content, attachments, subscriptionsIds, attachmentIds.map(it => ({attachmentId: it.id, type: it.type})));
      
      // Обновляем локальные данные
      setPost(prev => prev ? {
        ...prev,
        title,
        content
      } : null);
      
      // Обновляем список постов в WriterContext, если он доступен
      if (writerContext && writerContext.refreshPosts) {
        await writerContext.refreshPosts();
      }
      
      showNotification('Пост успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении поста:', error);
      showNotification('Ошибка при обновлении поста', 'error');
    }
  };

  // Удаление поста
  const deletePost = async () => {
    if (!isCurrentUserAuthor) {
      showNotification('У вас нет прав для удаления этого поста', 'error');
      return;
    }

    try {
      await writerService.deletePost(postId);
      
      // Обновляем список постов в WriterContext, если он доступен
      if (writerContext && writerContext.refreshPosts) {
        await writerContext.refreshPosts();
      }
      
      showNotification('Пост успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
      showNotification('Ошибка при удалении поста', 'error');
    }
  };

  // Поставить лайк посту
  const likePost = async () => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы поставить лайк', 'error');
      return;
    }

    if (!isPostAvailable) {
      showNotification('Вы не можете поставить лайк недоступному посту', 'error');
      return;
    }

    try {
      await writerService.likePost(user.id, postId);
      setIsLiked(true);
      setPost(post ? {
        ...post,
        likes_count: post?.likes_count ? post?.likes_count + 1 : 1
      } : null)
      showNotification('Лайк успешно поставлен', 'success');
    } catch (error) {
      console.error('Ошибка при постановке лайка:', error);
      showNotification('Ошибка при постановке лайка', 'error');
    }
  };

  // Убрать лайк с поста
  const unlikePost = async () => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы убрать лайк', 'error');
      return;
    }

    try {
      await writerService.unlikePost(user.id, postId);
      setIsLiked(false);
      setPost(post ? {
        ...post,
        likes_count: post?.likes_count ? post?.likes_count - 1 : 0
      } : null)
      showNotification('Лайк успешно убран', 'success');
    } catch (error) {
      console.error('Ошибка при удалении лайка:', error);
      showNotification('Ошибка при удалении лайка', 'error');
    }
  };

  // Добавить комментарий к посту
  const addComment = async (text: string): Promise<string> => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы оставить комментарий', 'error');
      return '';
    }

    if (!isPostAvailable) {
      showNotification('Вы не можете комментировать недоступный пост', 'error');
      return '';
    }

    try {
      const commentId = await writerService.addComment(user.id, postId, text);
      await refreshComments();
      showNotification('Комментарий успешно добавлен', 'success');
      return commentId;
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      showNotification('Ошибка при добавлении комментария', 'error');
      return '';
    }
  };
  
  // Редактировать комментарий
  const editComment = async (commentId: string, text: string): Promise<void> => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы редактировать комментарий', 'error');
      return;
    }
    
    // Проверяем, является ли пользователь автором комментария
    const isAuthor = await writerService.isCommentAuthor(user.id, commentId, postId);
    if (!isAuthor) {
      showNotification('Вы не можете редактировать чужой комментарий', 'error');
      return;
    }
    
    try {
      await writerService.editComment(commentId, text);
      await refreshComments();
      showNotification('Комментарий успешно отредактирован', 'success');
    } catch (error) {
      console.error('Ошибка при редактировании комментария:', error);
      showNotification('Ошибка при редактировании комментария', 'error');
    }
  };
  
  // Проверить, является ли пользователь автором комментария
  const isCommentAuthor = async (commentId: string): Promise<boolean> => {
    if (!user?.id) return false;
    return await writerService.isCommentAuthor(user.id, commentId, postId);
  };

  // Удалить комментарий
  const deleteComment = async (commentId: string): Promise<void> => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы удалить комментарий', 'error');
      return;
    }

    try {
      await writerService.deleteComment(commentId, postId);
      await refreshComments();
      showNotification('Комментарий успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
      showNotification('Ошибка при удалении комментария', 'error');
    }
  };

  // Поставить лайк комментарию
  const likeComment = async (commentId: string): Promise<void> => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы поставить лайк комментарию', 'error');
      return;
    }

    try {
      await writerService.likeComment(user.id, commentId, postId);
      showNotification('Лайк комментарию успешно поставлен', 'success');
    } catch (error) {
      console.error('Ошибка при постановке лайка комментарию:', error);
      showNotification('Ошибка при постановке лайка комментарию', 'error');
    }
  };

  // Убрать лайк с комментария
  const unlikeComment = async (commentId: string): Promise<void> => {
    if (!user?.id) {
      showNotification('Вы должны быть авторизованы, чтобы убрать лайк с комментария', 'error');
      return;
    }

    try {
      await writerService.unlikeComment(user.id, commentId, postId);
      showNotification('Лайк с комментария успешно убран', 'success');
    } catch (error) {
      console.error('Ошибка при удалении лайка с комментария:', error);
      showNotification('Ошибка при удалении лайка с комментария', 'error');
    }
  };

  // Проверить, поставил ли пользователь лайк комментарию
  const isCommentLiked = async (commentId: string): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    try {
      return await writerService.isCommentLiked(user.id, commentId, postId);
    } catch (error) {
      console.error('Ошибка при проверке лайка комментария:', error);
      return false;
    }
  };

  return (
    <PostContext.Provider
      value={{
        post,
        attachmentIds,
        commentIds,
        comments,
        isLoading,
        isCurrentUserAuthor,
        isPostAvailable,
        isLiked,
        updatePost,
        deletePost,
        refreshAttachments,
        refreshComments,
        likePost,
        unlikePost,
        addComment,
        editComment,
        deleteComment,
        likeComment,
        unlikeComment,
        isCommentLiked,
        isCommentAuthor
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
