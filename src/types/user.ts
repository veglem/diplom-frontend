/**
 * Типы для данных пользователя
 */

// Интерфейс для настроек уведомлений
export interface NotificationSettings {
  newPosts: boolean;
  news: boolean;
  commentReplies: boolean;
  commentLikes: boolean;
}

// Интерфейс для данных пользователя
export interface UserData {
  id: string;
  username: string;
  login: string;
  avatar?: string;
  isAuthor?: boolean;
  notificationSettings: NotificationSettings;
}

export interface Writer extends UserData {
  isAuthor: true;
  bio: string;
  goal: { current: number; target: number; };
  subscriptions: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  attachment_ids?: string[];
  attachment_types?: string[];
}
