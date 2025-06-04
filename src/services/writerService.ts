import { db } from "../utils/db";
import { Writer, Post } from "../types/user";
import { fileToUrl } from "../utils/databaseUtils";
import { api } from "../utils/api";
import { useWriter } from "../contexts/WriterContext";
import { useNotification } from "../contexts/NotificationContext";
import { fi, is } from "date-fns/locale";
import { Comment } from "../contexts/PostContext";

class WriterService {

  
  /**
   * Получить ID писателя для текущего пользователя
   * @param userId ID пользователя
   * @returns ID писателя или undefined, если пользователь не является писателем
   */
  async getSelfWriterId(userId: string): Promise<string | undefined> {
    return (await api.getProfile()).creator_id;
  }

  /**
   * Получить профиль писателя по ID
   * @param writerId ID писателя
   * @returns Профиль писателя или undefined, если писатель не найден
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/profile
   */
  async getWriterProfile(writerId: string): Promise<Writer | undefined> {
    const creatorInfo = await api.getCreatorPage(writerId);

      return {
        id: creatorInfo.creator_info.user_id,
        username: creatorInfo.creator_info.name,
        login: creatorInfo.creator_info.name,
        avatar: creatorInfo.creator_info.profile_photo,
        isAuthor: creatorInfo.is_my_page,
        bio: creatorInfo.creator_info.description,
        goal: {
          aim: creatorInfo.aim.description,
          current: creatorInfo.aim.money_got,
          target: creatorInfo.aim.money_needed
        },
        subscriptions: creatorInfo.creator_info.followers_count,
        notificationSettings: {
          newPosts: true,
          news: true,
          commentReplies: true,
          commentLikes: true
        },
        profilePhoto: creatorInfo.creator_info.profile_photo,
        coverPhoto: creatorInfo.creator_info.cover_photo,
        isMyPage: creatorInfo.is_my_page
      };
  }

  /**
   * Получить ID постов писателя
   * @param writerId ID писателя
   * @returns Массив ID постов писателя
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/posts/ids
   */
  async getWriterPostIds(writerId: string): Promise<string[]> {
    const creatorInfo = await api.getCreatorPage(writerId);

    if (!creatorInfo) return [];
    return creatorInfo.posts.map(post => (post.id))
  }

  /**
   * Получить посты писателя по ID
   * @param writerId ID писателя
   * @returns Массив постов писателя
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/posts
   */
  async getWriterPosts(writerId: string): Promise<Post[]> {
    const creatorInfo = await api.getCreatorPage(writerId);

    if (!creatorInfo) return [];
    return creatorInfo.posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.text,
        authorId: post.creator,
        attachment_ids: post.attachments.map(attachment => (attachment.id)),
        attachment_types: post.attachments.map(attachment => (attachment.type)),
        likes_count: post.likes_count,
        is_avalible: post.is_available,
        subscriptions: post.subscriptions.map(it => it.id ?? '')
    }))
  }

  /**
   * Получить количество подписчиков писателя
   * @param writerId ID писателя
   * @returns Количество подписчиков
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/followers/count
   */
  async getFollowersCount(writerId: string): Promise<number> {
    const creatorInfo = await api.getCreatorPage(writerId);

    if (!creatorInfo) return 0;
    return creatorInfo.creator_info.followers_count
  }

  /**
   * Подписаться на писателя
   * @param userId ID пользователя
   * @param writerId ID писателя
   * TODO: Заменить на реальный HTTP запрос POST /api/writers/{writerId}/followers
   */
  async followWriter(userId: string, writerId: string): Promise<void> {
    await api.follow(writerId);
  }

  /**
   * Отписаться от писателя
   * @param userId ID пользователя
   * @param writerId ID писателя
   * TODO: Заменить на реальный HTTP запрос DELETE /api/writers/{writerId}/followers
   */
  async unfollowWriter(userId: string, writerId: string): Promise<void> {
    await api.unfollow(writerId);
  }

  /**
   * Проверить, подписан ли пользователь на писателя
   * @param userId ID пользователя
   * @param writerId ID писателя
   * @returns true, если пользователь подписан на писателя, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/followers/{userId}
   */
  async isFollowing(userId: string, writerId: string): Promise<boolean> {
    return (await api.getCreatorPage(writerId)).follows;
  }

  /**
   * Обновить профиль писателя
   * @param writerId ID писателя
   * @param data Новые данные профиля
   * TODO: Заменить на реальный HTTP запрос PATCH /api/writers/{writerId}/profile
   */
  async updateWriterProfile(writerId: string, data: { name: string; description: string; }): Promise<void> {
    await api.updateCreatorData({
        name: data.name,
        description: data.description
      })
  }

  /**
   * Обновить аватар писателя
   * @param writerId ID писателя
   * @param photo Файл с новым аватаром
   * @returns URL нового аватара
   * TODO: Заменить на реальный HTTP запрос POST /api/writers/{writerId}/avatar
   */
  async updateWriterAvatar(writerId: string, photo: File): Promise<string> {
    const creatorData = await api.getCreatorPage(writerId);

    const url = await api.updateCreatorProfilePhoto(photo, creatorData.creator_info.profile_photo ?? '00000000-0000-0000-0000-000000000000')
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
    const creatorData = await api.getCreatorPage(writerId);
    const url = await api.updateCreatorCoverPhoto(photo, creatorData.creator_info.cover_photo ?? '00000000-0000-0000-0000-000000000000')
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
    const creator = await api.getCreatorPage(writerId)
    await api.createAim({
      creator_id: writerId,
      description: aim,
      money_needed: moneyNeeded,
      money_got: creator.aim.money_got
    })
  }

  /**
   * Получить пост по ID
   * @param postId ID поста
   * @returns Пост или undefined, если пост не найден
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}
   */
  async getPost(postId: string): Promise<Post | undefined> {
    const post = await api.getPost(postId);

    return {
      id: post.post.id,
      title: post.post.title || "Без названия",
      content: post.post.text || "",
      authorId: post.post.creator,
      likes_count: post.post.likes_count,
      is_avalible: post.post.is_available,
      subscriptions: post.post?.subscriptions?.map(it => it.id ?? '') ?? []
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
  async createPost(writerId: string, title: string, content: string, attachments: File[] = [], subscriptionIds: string[]): Promise<string> {
    await api.createPost({
      creator: writerId,
      title: title,
      text: content,
      available_subscriptions: subscriptionIds,
    }, attachments);

    return (await api.getCreatorPage(writerId)).posts[0].id;
  }

  /**
   * Получить ID атачей поста
   * @param postId ID поста
   * @returns Массив ID атачей
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/attachments
   */
  async getPostAttachmentIds(postId: string): Promise<{id: string, type: string}[]> {
    const res = (await api.getPost(postId)).post.attachments.map(attach => (
      {id: attach.id, type: attach.type}
    ))
    console.log(res)
    return res;
  }

  /**
   * Получить ID комментариев поста
   * @param postId ID поста
   * @returns Массив ID комментариев
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/comments
   */
  async getPostCommentIds(postId: string): Promise<string[]> {
    const comments = (await api.getPost(postId)).comments
    if (comments == undefined || comments.length == 0) {
      return []
    }
    return comments.map(comment => comment.comment_id).filter(it => it != undefined);
  }

  /**
   * Обновить пост
   * @param postId ID поста
   * @param title Новый заголовок поста
   * @param content Новое содержимое поста
   * TODO: Заменить на реальный HTTP запрос PATCH /api/posts/{postId}
   */
  async updatePost(postId: string, title: string, content: string, attachments: File[] = [], subscriptionIds: string[], oldAttacmentsIds: {attachmentId: string, type: string}[]): Promise<void> {
    await api.editPost(postId, {
      id: postId,
      title: title,
      text: content,
      available_subscriptions: subscriptionIds,
    })
    await oldAttacmentsIds.forEach( async attach => {
      await api.deleteAttachmentFromPost(postId, attach.attachmentId, attach.type);
    })
    await attachments.forEach(async file => {
      await api.addAttachmentToPost(postId, file);
    })
  }

  /**
   * Удалить пост
   * @param postId ID поста
   * TODO: Заменить на реальный HTTP запрос DELETE /api/posts/{postId}
   */
  async deletePost(postId: string): Promise<void> {
    await api.deletePost(postId);
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
    const profile = await api.getProfile()
    const post = await api.getPost(postId);
    if (profile.is_creator && profile.creator_id == post.post.creator) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Поставить лайк посту
   * @param userId ID пользователя
   * @param postId ID поста
   * TODO: Заменить на реальный HTTP запрос POST /api/posts/{postId}/likes
   */
  async likePost(userId: string, postId: string): Promise<void> {
    await api.addLike(postId);
  }

  /**
   * Убрать лайк с поста
   * @param userId ID пользователя
   * @param postId ID поста
   * TODO: Заменить на реальный HTTP запрос DELETE /api/posts/{postId}/likes
   */
  async unlikePost(userId: string, postId: string): Promise<void> {
    api.removeLike(postId);
  }

  /**
   * Проверить, поставил ли пользователь лайк посту
   * @param userId ID пользователя
   * @param postId ID поста
   * @returns true, если пользователь поставил лайк посту, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/likes/{userId}
   */
  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    return (await api.getPost(postId)).post.is_liked
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
    const comment = await api.createComment({
      post_id: postId,
      text: text,
    })
    return comment.comment_id!;
  }

  /**
   * Удалить комментарий
   * @param commentId ID комментария
   * TODO: Заменить на реальный HTTP запрос DELETE /api/comments/{commentId}
   */
  async deleteComment(commentId: string, postId: string): Promise<void> {
    await api.deleteComment(commentId, postId)
  }

  /**
   * Поставить лайк комментарию
   * @param userId ID пользователя
   * @param commentId ID комментария
   * TODO: Заменить на реальный HTTP запрос POST /api/comments/{commentId}/likes
   */
  async likeComment(userId: string, commentId: string, postId: string): Promise<void> {
    await api.addLikeToComment(commentId, postId)
  }

  /**
   * Убрать лайк с комментария
   * @param userId ID пользователя
   * @param commentId ID комментария
   * TODO: Заменить на реальный HTTP запрос DELETE /api/comments/{commentId}/likes
   */
  async unlikeComment(userId: string, commentId: string, postId: string): Promise<void> {
    await api.removeLikeFromComment(commentId)
  }

  /**
   * Проверить, поставил ли пользователь лайк комментарию
   * @param userId ID пользователя
   * @param commentId ID комментария
   * @returns true, если пользователь поставил лайк комментарию, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/comments/{commentId}/likes/{userId}
   */
  async isCommentLiked(userId: string, commentId: string, postId: string): Promise<boolean> {
    const comment = (await api.getPost(postId)).comments.find(post => post.comment_id == commentId)
    return comment?.is_liked ?? false
  }

  /**
   * Получить комментарии поста
   * @param postId ID поста
   * @returns Массив комментариев
   * TODO: Заменить на реальный HTTP запрос GET /api/posts/{postId}/comments
   */
  async getPostComments(postId: string): Promise<Comment[]> {
    const comments = (await api.getPost(postId)).comments
    if (comments == undefined || comments.length == 0) {
      return []
    }
    return comments.map(comment => ({
      comment_id: comment.comment_id!,
      user_id: comment.user_id!,
      display_name: comment.username!,
      profile_photo: comment.user_photo!,
      post_id: comment.post_id!,
      comment_text: comment.text!,
      creation_date: new Date(comment.creation!),
      likes_count: comment.likes_count!
    } as Comment)).filter(it => it != null)
  }

  /**
   * Редактировать комментарий
   * @param commentId ID комментария
   * @param text Новый текст комментария
   * TODO: Заменить на реальный HTTP запрос PATCH /api/comments/{commentId}
   */
  async editComment(commentId: string, text: string): Promise<void> {
    await api.editComment(commentId, text);
  }

  /**
   * Проверить, является ли пользователь автором комментария
   * @param userId ID пользователя
   * @param commentId ID комментария
   * @returns true, если пользователь является автором комментария, иначе false
   * TODO: Заменить на реальный HTTP запрос GET /api/comments/{commentId}/author
   */
  async isCommentAuthor(userId: string, commentId: string, postId: string): Promise<boolean> {
    const comment = (await api.getPost(postId)).comments.find(post => post.comment_id == commentId)
    console.log(comment)
    return comment?.is_owner ?? false
  }

  /**
   * Получить уровни подписки автора
   * @param writerId ID автора
   * @returns Массив уровней подписки
   * TODO: Заменить на реальный HTTP запрос GET /api/writers/{writerId}/subscriptions
   */
  async getCreatorSubscriptions(writerId: string): Promise<{
    id: string;
    title: string;
    price: string;
    description: string;
    is_avalible: boolean;
  }[]> {
    const writer = await api.getCreatorPage(writerId)
    return writer.subscriptions ? writer.subscriptions.map(sub => ({
      id: sub.id ?? '',
      title: sub.title,
      price: `${sub.month_cost}`,
      description: sub.description ?? '',
      is_avalible: true
    })) : [];
  }

  /**
   * Создать новый уровень подписки
   * @param writerId ID автора
   * @param title Название уровня подписки
   * @param price Цена уровня подписки
   * @param description Описание уровня подписки
   * @returns ID созданного уровня подписки
   * TODO: Заменить на реальный HTTP запрос POST /api/writers/{writerId}/subscriptions
   */
  async createSubscription(
    writerId: string,
    title: string,
    price: number,
    description: string
  ): Promise<string> {
    return (await api.createSubscription({
      title: title,
      month_cost: price,
      description: description,
    })).id!;
  }

  /**
   * Обновить уровень подписки
   * @param subscriptionId ID уровня подписки
   * @param title Новое название уровня подписки
   * @param price Новая цена уровня подписки
   * @param description Новое описание уровня подписки
   * TODO: Заменить на реальный HTTP запрос PATCH /api/subscriptions/{subscriptionId}
   */
  async updateSubscription(
    subscriptionId: string,
    title: string,
    price: number,
    description: string,
    creatorId: string
  ): Promise<void> {
    await api.editSubscription(subscriptionId, {
      creator: creatorId,
      title: title,
      month_cost: price,
      description: description,
    });
  }

  /**
   * Удалить уровень подписки
   * @param writerId ID автора
   * @param subscriptionId ID уровня подписки
   * TODO: Заменить на реальный HTTP запрос DELETE /api/writers/{writerId}/subscriptions/{subscriptionId}
   */
  async deleteSubscription(writerId: string, subscriptionId: string): Promise<void> {
    await api.deleteSubscription(subscriptionId);
  }

  /**
   * Подписаться на уровень подписки
   * @param userId ID пользователя
   * @param subscriptionId ID уровня подписки
   * @param months Количество месяцев подписки
   * TODO: Заменить на реальный HTTP запрос POST /api/subscriptions/{subscriptionId}/subscribe
   */
  async subscribeToLevel(
    userId: string,
    subscriptionId: string,
    months: number,
    creatorId: string,
    price: number
  ): Promise<void> {
    // await api.addPaymentInfo(subscriptionId, {
    //   creator_id: creatorId,
    //   month_count: months
    // })
    await api.subscribe(subscriptionId, {
      creator_id: creatorId,
      month_count: months,
      money: price * months
    })
  }

  async getUserSubLevels(userId: string): Promise<({
    subscription_id: string;
    creator_id: string;
    name: string;
    profile_photo: string | undefined;
    month_cost: number;
    title: string;
    description: string | undefined;
} | null)[]> {
    return (await api.getSubscriptions()).map(sub => ({
      subscription_id: sub.id!,
      creator_id: sub.creator!,
      name: sub.creator_name!,
      profile_photo: sub.creator_photo,
      month_cost: sub.month_cost,
      title: sub.title,
      description: sub.description
    }))
  }
}

export const writerService = new WriterService();
