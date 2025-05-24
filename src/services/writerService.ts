import { db } from "../utils/db";
import { Writer, Post } from "../types/user";
import { fileToUrl } from "../utils/databaseUtils";

class WriterService {
  /**
   * Получить ID писателя для текущего пользователя
   * @param userId ID пользователя
   * @returns ID писателя или undefined, если пользователь не является писателем
   */
  async getSelfWriterId(userId: string): Promise<string | undefined> {
    return await db.checkIfCreator(userId)?.creator_id;
  }

  /**
   * Получить профиль писателя по ID
   * @param writerId ID писателя
   * @returns Профиль писателя или undefined, если писатель не найден
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/profile
   */
  async getWriterProfile(writerId: string): Promise<Writer | undefined> {
    const creatorInfo = db.creatorInfo(writerId);
    if (!creatorInfo) return undefined;

    const userProfile = db.userProfile(creatorInfo.user_id);
    if (!userProfile) return undefined;

    return {
      id: creatorInfo.user_id,
      username: userProfile.display_name,
      login: userProfile.login,
      avatar: creatorInfo.profile_photo || userProfile.profile_photo,
      isAuthor: true,
      bio: creatorInfo.description || "",
      goal: {
        current: creatorInfo.money_got,
        target: creatorInfo.money_needed
      },
      subscriptions: creatorInfo.followers_count,
      notificationSettings: {
        newPosts: true,
        news: true,
        commentReplies: true,
        commentLikes: true
      }
    };
  }

  /**
   * Получить ID постов писателя
   * @param writerId ID писателя
   * @returns Массив ID постов писателя
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/posts/ids
   */
  async getWriterPostIds(writerId: string): Promise<string[]> {
    const posts = db.creatorPosts(writerId);
    return posts.map(post => post.post_id);
  }

  /**
   * Получить посты писателя по ID
   * @param writerId ID писателя
   * @returns Массив постов писателя
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/posts
   */
  async getWriterPosts(writerId: string): Promise<Post[]> {
    const posts = db.creatorPosts(writerId);
    
    return posts.map(post => ({
      id: post.post_id,
      title: post.title || "Без названия",
      content: post.post_text || "",
      authorId: writerId
    }));
  }

  /**
   * Получить количество подписчиков писателя
   * @param writerId ID писателя
   * @returns Количество подписчиков
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/followers/count
   */
  async getFollowersCount(writerId: string): Promise<number> {
    const creatorInfo = db.creatorInfo(writerId);
    return creatorInfo?.followers_count || 0;
  }

  /**
   * Подписаться на писателя
   * @param userId ID пользователя
   * @param writerId ID писателя
   * TODO: Заменить на реальный HTTP запрос POST /api/writers/{writerId}/followers
   */
  async followWriter(userId: string, writerId: string): Promise<void> {
    db.follow(userId, writerId);
  }

  /**
   * Отписаться от писателя
   * @param userId ID пользователя
   * @param writerId ID писателя
   * TODO: Заменить на реальный HTTP запрос DELETE /api/writers/{writerId}/followers
   */
  async unfollowWriter(userId: string, writerId: string): Promise<void> {
    db.unfollow(userId, writerId);
  }

  /**
   * Проверить, подписан ли пользователь на писателя
   * @param userId ID пользователя
   * @param writerId ID писателя
   * @returns true, если пользователь подписан на писателя, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/followers/{userId}
   */
  async isFollowing(userId: string, writerId: string): Promise<boolean> {
    return !!db.checkIfFollow(userId, writerId);
  }

  /**
   * Обновить профиль писателя
   * @param writerId ID писателя
   * @param data Новые данные профиля
   * TODO: Заменить на реальный HTTP запрос PATCH /api/writers/{writerId}/profile
   */
  async updateWriterProfile(writerId: string, data: { name?: string; description?: string; }): Promise<void> {
    const { name, description } = data;
    const creatorInfo = db.creatorInfo(writerId);
    
    if (!creatorInfo) return;
    
    db.updateCreatorData(
      name || creatorInfo.name,
      description || creatorInfo.description || "",
      writerId
    );
  }

  /**
   * Обновить аватар писателя
   * @param writerId ID писателя
   * @param photo Файл с новым аватаром
   * @returns URL нового аватара
   * TODO: Заменить на реальный HTTP запрос POST /api/writers/{writerId}/avatar
   */
  async updateWriterAvatar(writerId: string, photo: File): Promise<string> {
    const url = await fileToUrl(photo);
    db.updateCreatorProfilePhoto(url, writerId);
    return url;
  }

  /**
   * Обновить обложку профиля писателя
   * @param writerId ID писателя
   * @param photo Файл с новой обложкой
   * @returns URL новой обложки
   * TODO: Заменить на реальный HTTP запрос POST /api/writers/{writerId}/cover
   */
  async updateWriterCover(writerId: string, photo: File): Promise<string> {
    const url = await fileToUrl(photo);
    db.updateCoverPhoto(url, writerId);
    return url;
  }

  /**
   * Обновить цель финансирования писателя
   * @param writerId ID писателя
   * @param aim Описание цели
   * @param moneyNeeded Необходимая сумма
   * TODO: Заменить на реальный HTTP запрос POST /api/writers/{writerId}/goal
   */
  async updateWriterGoal(writerId: string, aim: string, moneyNeeded: number): Promise<void> {
    const creatorInfo = db.creatorInfo(writerId);
    if (!creatorInfo) return;
    
    db.addAim(aim, creatorInfo.money_got, moneyNeeded, writerId);
  }

  /**
   * Получить пост по ID
   * @param postId ID поста
   * @returns Пост или undefined, если пост не найден
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}
   */
  async getPost(postId: string): Promise<Post | undefined> {
    const post = db.getPost(postId);
    if (!post) return undefined;
    
    return {
      id: post.post_id,
      title: post.title || "Без названия",
      content: post.post_text || "",
      authorId: post.creator_id
    };
  }

  /**
   * Создать новый пост
   * @param writerId ID писателя
   * @param title Заголовок поста
   * @param content Содержимое поста
   * @param attachments Список атачей (файлов)
   * @returns ID созданного поста
   * TODO: Заменить на реальный HTTP запрос POST /api/writers/{writerId}/posts
   */
  async createPost(writerId: string, title: string, content: string, attachments: File[] = []): Promise<string> {
    const postId = Math.random().toString(36).substr(2, 9);
    db.insertPost(postId, writerId, title, content);
    
    // Добавляем атачи к посту
    for (const attachment of attachments) {
      const attachmentUrl = await fileToUrl(attachment);
      db.insertAttach(attachmentUrl, postId, attachment.type);
    }
    
    return postId;
  }

  /**
   * Получить ID атачей поста
   * @param postId ID поста
   * @returns Массив ID атачей
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/attachments
   */
  async getPostAttachmentIds(postId: string): Promise<{id: string, type: string}[]> {
    const post = db.getPost(postId);
    if (!post) return [];
    
    return post.attachment_ids.map((val, index) => {
      return { id: val, type: post.attachment_types[index] }
    });
  }

  /**
   * Получить ID комментариев поста
   * @param postId ID поста
   * @returns Массив ID комментариев
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/comments
   */
  async getPostCommentIds(postId: string): Promise<string[]> {
    const comments = db.getComments(postId);
    return comments.map(comment => comment?.comment_id || '').filter(id => id !== '');
  }

  /**
   * Обновить пост
   * @param postId ID поста
   * @param title Новый заголовок поста
   * @param content Новое содержимое поста
   * TODO: Заменить на реальный HTTP запрос PATCH /api/posts/{postId}
   */
  async updatePost(postId: string, title: string, content: string): Promise<void> {
    db.updatePostInfo(title, content, postId);
  }

  /**
   * Удалить пост
   * @param postId ID поста
   * TODO: Заменить на реальный HTTP запрос DELETE /api/posts/{postId}
   */
  async deletePost(postId: string): Promise<void> {
    db.deletePost(postId);
  }

  /**
   * Проверить, доступен ли пост для пользователя
   * @param userId ID пользователя
   * @param postId ID поста
   * @returns true, если пост доступен, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/access
   */
  async isPostAvailable(userId: string, postId: string): Promise<boolean> {
    return !!db.isPostAvailableWithSub(userId, postId);
  }

  /**
   * Проверить, является ли пользователь автором поста
   * @param userId ID пользователя
   * @param postId ID поста
   * @returns true, если пользователь является автором поста, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/author
   */
  async isPostAuthor(userId: string, postId: string): Promise<boolean> {
    const post = db.getPost(postId);
    if (!post) return false;
    
    const creator = db.isCreator(post.creator_id);
    if (!creator) return false;
    
    return creator.user_id === userId;
  }

  /**
   * Поставить лайк посту
   * @param userId ID пользователя
   * @param postId ID поста
   * TODO: Заменить на реальный HTTP запрос POST /api/posts/{postId}/likes
   */
  async likePost(userId: string, postId: string): Promise<void> {
    db.addLike(postId, userId);
  }

  /**
   * Убрать лайк с поста
   * @param userId ID пользователя
   * @param postId ID поста
   * TODO: Заменить на реальный HTTP запрос DELETE /api/posts/{postId}/likes
   */
  async unlikePost(userId: string, postId: string): Promise<void> {
    db.removeLike(postId, userId);
  }

  /**
   * Проверить, поставил ли пользователь лайк посту
   * @param userId ID пользователя
   * @param postId ID поста
   * @returns true, если пользователь поставил лайк посту, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/likes/{userId}
   */
  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    return !!db.isLiked(postId, userId);
  }

  /**
   * Добавить комментарий к посту
   * @param userId ID пользователя
   * @param postId ID поста
   * @param text Текст комментария
   * @returns ID созданного комментария
   * TODO: Заменить на реальный HTTP запрос POST /api/posts/{postId}/comments
   */
  async addComment(userId: string, postId: string, text: string): Promise<string> {
    const commentId = Math.random().toString(36).substr(2, 9);
    db.createComment(commentId, postId, userId, text);
    return commentId;
  }

  /**
   * Удалить комментарий
   * @param commentId ID комментария
   * TODO: Заменить на реальный HTTP запрос DELETE /api/comments/{commentId}
   */
  async deleteComment(commentId: string): Promise<void> {
    db.deleteComment(commentId);
  }

  /**
   * Поставить лайк комментарию
   * @param userId ID пользователя
   * @param commentId ID комментария
   * TODO: Заменить на реальный HTTP запрос POST /api/comments/{commentId}/likes
   */
  async likeComment(userId: string, commentId: string): Promise<void> {
    db.addLikeComment(commentId, userId);
  }

  /**
   * Убрать лайк с комментария
   * @param userId ID пользователя
   * @param commentId ID комментария
   * TODO: Заменить на реальный HTTP запрос DELETE /api/comments/{commentId}/likes
   */
  async unlikeComment(userId: string, commentId: string): Promise<void> {
    db.deleteLikeComment(commentId);
  }

  /**
   * Проверить, поставил ли пользователь лайк комментарию
   * @param userId ID пользователя
   * @param commentId ID комментария
   * @returns true, если пользователь поставил лайк комментарию, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/comments/{commentId}/likes/{userId}
   */
  async isCommentLiked(userId: string, commentId: string): Promise<boolean> {
    return !!db.isLikedComment(commentId, userId);
  }
}

export const writerService = new WriterService();
