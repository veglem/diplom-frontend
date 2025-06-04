/**
 * SubMe API Client
 * TypeScript HTTP клиент для взаимодействия с бэкендом SubMe
 * 
 * Авторизационный токен хранится в куках по ключу SSID
 */

import { mutexManager } from "./mutexUtil";

// Базовые интерфейсы для моделей данных
interface User {
  id: string;
  login: string;
  name: string;
  profile_photo: string;
  password_hash?: string;
  registration?: string;
  user_version?: number;
}

interface UserProfile {
  login: string;
  name: string;
  profile_photo: string;
  registration: string;
  is_creator: boolean;
  creator_id: string;
}

interface Creator {
  creator_id: string;
  user_id: string;
  name: string;
  cover_photo: string;
  profile_photo: string;
  followers_count: number;
  description: string;
  posts_count: number;
}

interface CreatorPage {
  creator_info: Creator;
  aim: Aim;
  is_my_page: boolean;
  follows: boolean;
  posts: Post[];
  subscriptions: Subscription[];
}

interface Post {
  id: string;
  creator: string;
  creator_photo?: string;
  creator_name?: string;
  creation_date: string;
  likes_count: number;
  comments_count: number;
  title: string;
  text: string;
  is_available: boolean;
  is_liked: boolean;
  attachments: Attachment[];
  subscriptions: Subscription[];
}

interface PostWithComments {
  post: Post;
  comments: Comment[];
}

interface Comment {
  comment_id?: string;
  user_id?: string;
  username?: string;
  user_photo?: string;
  post_id: string;
  text: string;
  creation?: string;
  likes_count?: number;
  is_liked?: boolean;
  is_owner?: boolean;
}

interface Attachment {
  id: string;
  type: string;
}

interface Subscription {
  id?: string;
  creator?: string;
  creator_name?: string;
  creator_photo?: string;
  month_cost: number;
  title: string;
  description?: string;
}

interface Follow {
  creator: string;
  creator_name: string;
  creator_photo: string;
  description: string;
}

interface Aim {
  creator_id: string;
  description: string;
  money_needed: number;
  money_got: number;
}

interface Like {
  likes_count: number;
  post_id: string;
}

interface Statistics {
  creator_id: string;
  posts_per_month: number;
  subscriptions_bought: number;
  donations_count: number;
  money_from_donations: number;
  money_from_subscriptions: number;
  new_followers: number;
  likes_count: number;
  comments_count: number;
}

interface StatisticsDates {
  creator_id?: string;
  first_month: string;
  second_month: string;
}

// Интерфейсы для запросов
interface LoginUser {
  login: string;
  password_hash: string;
}

interface UpdatePasswordInfo {
  new_password: string;
  old_password: string;
}

interface UpdateProfileInfo {
  login: string;
  name: string;
}

interface BecameCreatorInfo {
  name: string;
  description: string;
}

interface Donate {
  creator_id: string;
  money_count: number;
}

interface SubscriptionDetails {
  creator_id: string;
  id?: string;
  user_id?: string;
  month_count?: number;
  payment_info?: string;
  money?: number;
}

interface PostCreationData {
  id?: string;
  creator: string;
  title: string;
  text: string;
  available_subscriptions?: string[];
}

interface PostEditData {
  id?: string;
  title: string;
  text: string;
  available_subscriptions?: string[];
}

interface CreatorTransfer {
  money: number;
  creator_id?: string;
  phone_number: string;
}

interface NotificationToken {
  notification_token: string;
}



// Интерфейс для кеша
interface CacheItem<T> {
  data: T;
  expiry: number;
}

// Класс для работы с API
export class SubMeApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;
  private cache: Map<string, CacheItem<any>> = new Map();
  private cacheDuration: number = 5000; // 5 секунд в миллисекундах

  /**
   * Создает новый экземпляр API клиента
   * @param baseUrl Базовый URL API (по умолчанию http://localhost:8080)
   */
  constructor(baseUrl: string = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
  }

  /**
   * Очищает весь кеш
   */
  private clearCache(): void {
    this.cache.clear();
  }

  /**
   * Проверяет, есть ли данные в кеше и не истекли ли они
   * @param cacheKey Ключ кеша
   * @returns Данные из кеша или null, если данных нет или они истекли
   */
  private getFromCache<T>(cacheKey: string): T | null {
    const cachedItem = this.cache.get(cacheKey);
    const now = Date.now();

    if (cachedItem && cachedItem.expiry > now) {
      return cachedItem.data as T;
    }

    // Удаляем истекшие данные из кеша
    if (cachedItem) {
      this.cache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Сохраняет данные в кеш
   * @param cacheKey Ключ кеша
   * @param data Данные для сохранения
   */
  private saveToCache<T>(cacheKey: string, data: T): void {
    const expiry = Date.now() + this.cacheDuration;
    this.cache.set(cacheKey, { data, expiry });
  }

  /**
   * Выполняет HTTP запрос к API
   * @param method HTTP метод
   * @param endpoint Эндпоинт API
   * @param data Данные для отправки
   * @param isFormData Флаг, указывающий, что данные нужно отправить как FormData
   * @returns Ответ от API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    isFormData: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Если это GET-запрос, проверяем кеш
    if (method === 'GET') {
      const cacheKey = url;
      const cachedData = this.getFromCache<T>(cacheKey);
      
      if (cachedData) {
        console.log(`[API Cache] Returning cached data for ${url}`);
        return cachedData;
      }
    } else {
      // Если это не GET-запрос, очищаем весь кеш
      this.clearCache();
    }
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (this.csrfToken) {
      headers['X-Csrf-Token'] = this.csrfToken;
    }

    let body: BodyInit | null = null;
    if (data) {
      if (isFormData) {
        body = data;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
      credentials: 'include', // Для работы с куками (авторизационный токен хранится в куках по ключу SSID)
    });

    // Сохраняем CSRF токен, если он есть в заголовках
    const csrfToken = response.headers.get('X-CSRF-Token');
    if (csrfToken) {
      this.csrfToken = csrfToken;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const responseData = await response.json().catch(() => ({} as T));
    
    // Если это GET-запрос, сохраняем результат в кеш
    if (method === 'GET') {
      const cacheKey = url;
      this.saveToCache(cacheKey, responseData);
      console.log(`[API Cache] Saved data to cache for ${url}`);
    }

    return responseData;
  }

  /**
   * Создает FormData из объекта
   * @param data Объект с данными
   * @returns FormData
   */
  private createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        if (value.every(item => item instanceof File)) {
          // Если это массив файлов
          value.forEach((item) => {
            formData.append(key, item);
          });
        } else {
          // Если это массив других значений
          value.forEach((item) => {
            formData.append(key, String(item));
          });
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    return formData;
  }

  // Auth API
  /**
   * Регистрация нового пользователя
   * @param data Данные для регистрации
   */
  async signUp(data: Pick<User, 'login' | 'name' | 'password_hash'>): Promise<void> {
    return this.request<void>('POST', '/api/auth/signUp', data);
  }

  /**
   * Вход пользователя
   * @param data Данные для входа
   */
  async signIn(data: LoginUser): Promise<void> {
    return this.request<void>('POST', '/api/auth/signIn', data);
  }

  /**
   * Выход пользователя
   */
  async logout(): Promise<void> {
    return this.request<void>('PUT', '/api/auth/logout');
  }

  // User API
  /**
   * Получение профиля пользователя
   */
  async getProfile(): Promise<UserProfile> {
    return mutexManager.runWithMutex('getProfile', [], async () => {
      return this.request<UserProfile>('GET', '/api/user/profile');
    }) 
  }

  /**
   * Получение ленты пользователя
   */
  async getFeed(): Promise<Post[]> {
    return this.request<Post[]>('GET', '/api/user/feed');
  }

  /**
   * Обновление фото профиля пользователя
   * @param file Файл с фото
   * @param path UUID старого фото (или uuid.Nil если фото не было)
   */
  async updateProfilePhoto(file: File, path: string): Promise<string> {
    const formData = this.createFormData({
      upload: file,
      path,
    });
    await this.request<string>('GET', '/api/user/updateProfilePhoto');
    return this.request<string>('PUT', '/api/user/updateProfilePhoto', formData, true);
  }

  /**
   * Обновление пароля пользователя
   * @param data Данные для обновления пароля
   */
  async updatePassword(data: UpdatePasswordInfo): Promise<void> {
    await this.request<void>('GET', '/api/user/updatePassword');
    return this.request<void>('PUT', '/api/user/updatePassword', data);
  }

  /**
   * Обновление данных профиля пользователя
   * @param data Данные для обновления профиля
   */
  async updateUserData(data: UpdateProfileInfo): Promise<void> {
    await this.request<void>('GET', '/api/user/updateData');
    return this.request<void>('PUT', '/api/user/updateData', data);
  }

  /**
   * Донат создателю контента
   * @param data Данные для доната
   */
  async donate(data: Donate): Promise<void> {
    return this.request<void>('POST', '/api/user/donate', data);
  }

  /**
   * Стать создателем контента
   * @param data Данные для создания профиля создателя
   */
  async becameCreator(data: BecameCreatorInfo): Promise<string> {
    await this.request<void>('GET', '/api/user/becameCreator');
    return this.request<string>('POST', '/api/user/becameCreator', data);
  }

  /**
   * Подписаться на создателя контента (бесплатно)
   * @param creatorId ID создателя
   */
  async follow(creatorId: string): Promise<void> {
    // await this.request<void>('GET', `/api/user/follow/${creatorId}`);
    return this.request<void>('POST', `/api/user/follow/${creatorId}`);
  }

  /**
   * Отписаться от создателя контента
   * @param creatorId ID создателя
   */
  async unfollow(creatorId: string): Promise<void> {
    // await this.request<void>('GET', `/api/user/unfollow/${creatorId}`);
    return this.request<void>('PUT', `/api/user/unfollow/${creatorId}`);
  }

  /**
   * Оформить платную подписку на создателя
   * @param creatorId ID создателя
   * @param data Данные для подписки
   */
  async subscribe(subId: string, data: SubscriptionDetails): Promise<void> {
    await this.request<void>('GET', `/api/user/subscribe/${subId}`);
    return this.request<void>('POST', `/api/user/subscribe/${subId}`, data);
  }

  /**
   * Получить список подписок пользователя
   */
  async getSubscriptions(): Promise<Subscription[]> {
    return mutexManager.runWithMutex('getSubscriptions', [], async () => {
      return this.request<Subscription[]>('GET', '/api/user/subscriptions');
    } )
  }

  /**
   * Удалить фото профиля пользователя
   * @param photoId ID фото
   */
  async deleteProfilePhoto(photoId: string): Promise<void> {
    return this.request<void>('GET', `/api/user/deleteProfilePhoto/${photoId}`);
  }

  /**
   * Получить список подписок на создателей
   */
  async getFollows(): Promise<Follow[]> {
    return this.request<Follow[]>('GET', '/api/user/follows');
  }

  /**
   * Добавить информацию о платеже
   * @param subUuid ID подписки
   * @param data Данные о платеже
   */
  async addPaymentInfo(subUuid: string, data: SubscriptionDetails): Promise<string> {
    await this.request<string>('GET', `/api/user/subscribe/${subUuid}`, data);
    return this.request<string>('POST', `/api/user/subscribe/${subUuid}`, data);
  }

  // Creator API
  /**
   * Получить страницу создателя
   * @param creatorId ID создателя
   */
  async getCreatorPage(creatorId: string): Promise<CreatorPage> {
    return this.request<CreatorPage>('GET', `/api/creator/page/${creatorId}`);
  }

  /**
   * Создать цель для сбора средств
   * @param data Данные для создания цели
   */
  async createAim(data: Aim): Promise<void> {
    return this.request<void>('POST', '/api/creator/aim/create', data);
  }

  /**
   * Получить список всех создателей
   */
  async getAllCreators(): Promise<Creator[]> {
    return this.request<Creator[]>('GET', '/api/creator/list');
  }

  /**
   * Поиск создателей
   * @param query Поисковый запрос
   */
  async searchCreators(query: string): Promise<Creator[]> {
    return this.request<Creator[]>('GET', `/api/creator/search/${query}`);
  }

  /**
   * Обновить данные создателя
   * @param data Данные для обновления
   */
  async updateCreatorData(data: BecameCreatorInfo): Promise<void> {
    await this.request<void>('GET', '/api/creator/updateData');
    return this.request<void>('PUT', '/api/creator/updateData', data);
  }

  /**
   * Обновить фото профиля создателя
   * @param file Файл с фото
   * @param path UUID старого фото (или uuid.Nil если фото не было)
   */
  async updateCreatorProfilePhoto(file: File, path: string): Promise<string> {
    const formData = this.createFormData({
      upload: file,
      path,
    });
    await this.request<string>('GET', '/api/creator/updateProfilePhoto');
    return this.request<string>('PUT', '/api/creator/updateProfilePhoto', formData, true);
  }

  /**
   * Обновить фото обложки создателя
   * @param file Файл с фото
   * @param path UUID старого фото (или uuid.Nil если фото не было)
   */
  async updateCreatorCoverPhoto(file: File, path: string): Promise<string> {
    const formData = this.createFormData({
      upload: file,
      path,
    });
    await this.request<string>('GET', '/api/creator/updateCoverPhoto');
    return this.request<string>('PUT', '/api/creator/updateCoverPhoto', formData, true);
  }

  /**
   * Удалить фото профиля создателя
   * @param photoId ID фото
   */
  async deleteCreatorProfilePhoto(photoId: string): Promise<void> {
    return this.request<void>('DELETE', `/api/creator/deleteProfilePhoto/${photoId}`);
  }

  /**
   * Удалить фото обложки создателя
   * @param photoId ID фото
   */
  async deleteCreatorCoverPhoto(photoId: string): Promise<void> {
    return this.request<void>('DELETE', `/api/creator/deleteCoverPhoto/${photoId}`);
  }

  /**
   * Получить баланс создателя
   */
  async getBalance(): Promise<number> {
    return this.request<number>('GET', '/api/creator/balance');
  }

  /**
   * Перевести деньги с баланса создателя
   * @param data Данные для перевода
   */
  async transferMoney(data: CreatorTransfer): Promise<number> {
    return this.request<number>('POST', '/api/creator/transfer', data);
  }

  /**
   * Получить статистику создателя
   * @param data Даты для статистики
   */
  async getStatistics(data: StatisticsDates): Promise<Statistics> {
    return this.request<Statistics>('POST', '/api/creator/statistics', data);
  }

  /**
   * Получить первую дату для статистики
   */
  async getStatisticsFirstDate(): Promise<string> {
    return this.request<string>('GET', '/api/creator/statistics/firstDate');
  }

  // Post API
  /**
   * Добавить лайк к посту
   * @param postId ID поста
   */
  async addLike(postId: string): Promise<Like> {
    return this.request<Like>('PUT', '/api/post/addLike', { post_id: postId });
  }

  /**
   * Удалить лайк с поста
   * @param postId ID поста
   */
  async removeLike(postId: string): Promise<Like> {
    return this.request<Like>('PUT', '/api/post/removeLike', { post_id: postId });
  }

  /**
   * Создать пост
   * @param data Данные для создания поста
   * @param attachments Вложения
   */
  async createPost(data: PostCreationData, attachments?: File[]): Promise<void> {
    const formData = this.createFormData({
      ...data,
      attachments,
      subscriptions: data.available_subscriptions
    });
    await this.request<void>('GET', '/api/post/create');
    return this.request<void>('POST', '/api/post/create', formData, true);
  }

  /**
   * Удалить пост
   * @param postId ID поста
   */
  async deletePost(postId: string): Promise<void> {
    await this.request<void>('GET', `/api/post/delete/${postId}`);
    return this.request<void>('DELETE', `/api/post/delete/${postId}`);
  }

  /**
   * Получить пост с комментариями
   * @param postId ID поста
   */
  async getPost(postId: string): Promise<PostWithComments> {
    return mutexManager.runWithMutex("getPost", [postId], async () => {
      return this.request<PostWithComments>('GET', `/api/post/get/${postId}`);
    })
  }

  /**
   * Редактировать пост
   * @param postId ID поста
   * @param data Данные для редактирования
   */
  async editPost(postId: string, data: PostEditData): Promise<void> {
    await this.request<void>('GET', `/api/post/edit/${postId}`);
    return this.request<void>('PUT', `/api/post/edit/${postId}`, data);
  }

  /**
   * Добавить вложение к посту
   * @param postId ID поста
   * @param attachment Вложение
   */
  async addAttachmentToPost(postId: string, attachment: File): Promise<void> {
    const formData = this.createFormData({
      attachment,
    });
    return this.request<void>('POST', `/api/post/addAttach/${postId}`, formData, true);
  }

  /**
   * Удалить вложение из поста
   * @param postId ID поста
   * @param attachmentId ID вложения
   * @param type Тип вложения
   */
  async deleteAttachmentFromPost(postId: string, attachmentId: string, type: string): Promise<void> {
    return this.request<void>('DELETE', `/api/post/deleteAttach/${postId}`, {
      id: attachmentId,
      type,
    });
  }

  // Comment API
  /**
   * Создать комментарий
   * @param data Данные комментария
   */
  async createComment(data: Comment): Promise<Comment> {
    await this.request<Comment>('GET', '/api/comment/create');
    return this.request<Comment>('POST', '/api/comment/create', data);
  }

  /**
   * Удалить комментарий
   * @param commentId ID комментария
   * @param postId ID поста
   */
  async deleteComment(commentId: string, postId: string): Promise<void> {
    await this.request<void>('GET', `/api/comment/delete/${commentId}`);
    return this.request<void>('DELETE', `/api/comment/delete/${commentId}`, { post_id: postId });
  }

  /**
   * Редактировать комментарий
   * @param commentId ID комментария
   * @param text Новый текст комментария
   */
  async editComment(commentId: string, text: string): Promise<void> {
    await this.request<void>('GET', `/api/comment/edit/${commentId}`);
    return this.request<void>('PUT', `/api/comment/edit/${commentId}`, { text });
  }

  /**
   * Добавить лайк к комментарию
   * @param commentId ID комментария
   * @param postId ID поста
   */
  async addLikeToComment(commentId: string, postId: string): Promise<number> {
    return this.request<number>('PUT', `/api/comment/addLike/${commentId}`, { post_id: postId });
  }

  /**
   * Удалить лайк с комментария
   * @param commentId ID комментария
   */
  async removeLikeFromComment(commentId: string): Promise<number> {
    return this.request<number>('PUT', `/api/comment/removeLike/${commentId}`);
  }

  // Subscription API
  /**
   * Создать подписку
   * @param data Данные подписки
   */
  async createSubscription(data: Subscription): Promise<Subscription> {
    await this.request<Subscription>('GET', '/api/subscription/create');
    return this.request<Subscription>('POST', '/api/subscription/create', data);
  }

  /**
   * Удалить подписку
   * @param subscriptionId ID подписки
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    await this.request<void>('GET', `/api/subscription/delete/${subscriptionId}`);
    return this.request<void>('DELETE', `/api/subscription/delete/${subscriptionId}`);
  }

  /**
   * Редактировать подписку
   * @param subscriptionId ID подписки
   * @param data Данные для редактирования
   */
  async editSubscription(subscriptionId: string, data: Subscription): Promise<void> {
    await this.request<void>('GET', `/api/subscription/edit/${subscriptionId}`);
    return this.request<void>('PUT', `/api/subscription/edit/${subscriptionId}`, data);
  }

  // Notification API
  /**
   * Подписаться на уведомления от создателя
   * @param creatorId ID создателя
   * @param token Токен для уведомлений
   */
  async subscribeToNotifications(creatorId: string, token: NotificationToken): Promise<void> {
    return this.request<void>('POST', `/api/user/notifications/subscribe/${creatorId}`, token);
  }

  /**
   * Отписаться от уведомлений от создателя
   * @param creatorId ID создателя
   * @param token Токен для уведомлений
   */
  async unsubscribeFromNotifications(creatorId: string, token: NotificationToken): Promise<void> {
    return this.request<void>('POST', `/api/user/notifications/unsubscribe/${creatorId}`, token);
  }

  /**
   * Подписаться на уведомления для создателя
   * @param token Токен для уведомлений
   */
  async subscribeCreatorToNotifications(token: NotificationToken): Promise<void> {
    return this.request<void>('POST', '/api/creator/notifications/subscribe', token);
  }

  /**
   * Отписаться от уведомлений для создателя
   * @param token Токен для уведомлений
   */
  async unsubscribeCreatorFromNotifications(token: NotificationToken): Promise<void> {
    return this.request<void>('POST', '/api/creator/notifications/unsubscribe', token);
  }
}

export const api = new SubMeApiClient()

/**
 * Примечания по авторизации:
 * 
 * 1. Авторизационный токен хранится в куках по ключу SSID
 * 2. При вызове signIn() токен автоматически сохраняется в куках
 * 3. При вызове logout() токен удаляется из кук
 * 4. Все запросы автоматически отправляют куки с токеном благодаря опции credentials: 'include'
 */

// Пример использования:
/*
const api = new SubMeApiClient('https://sub-me.ru');

// Авторизация (токен SSID будет автоматически сохранен в куках)
api.signIn({
  login: 'username',
  password_hash: 'password'
})
.then(() => {
  console.log('Успешная авторизация');
  
  // Получение профиля (токен SSID автоматически отправляется с запросом)
  return api.getProfile();
})
.then(profile => {
  console.log('Профиль:', profile);
  
  // Получение ленты
  return api.getFeed();
})
.then(posts => {
  console.log('Лента:', posts);
})
.catch(error => {
  console.error('Ошибка:', error);
});
*/
