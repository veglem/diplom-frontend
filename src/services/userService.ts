import { UserData } from '../types/user';
import { db } from '../utils/db';

export class UserService {
    /**
     * Получить данные профиля пользователя
     * @param userId ID пользователя
     * @returns Данные пользователя
     * TODO: Заменить на реальный HTTP запрос GET /api/users/{userId}/profile
     */
    static getUserProfile(userId: string): UserData | null {
        const userProfile = db.userProfile(userId);
        if (!userProfile) return null;

        return {
            id: userId,
            username: userProfile.display_name,
            login: userProfile.login,
            avatar: userProfile.profile_photo,
            notificationSettings: {
                newPosts: true, // В моковой БД нет этих настроек, поэтому хардкодим
                news: true,
                commentReplies: true,
                commentLikes: true
            }
        };
    }

    /**
     * Обновить данные профиля пользователя
     * @param userId ID пользователя
     * @param data Новые данные профиля
     * TODO: Заменить на реальный HTTP запрос PATCH /api/users/{userId}/profile
     */
    static updateUserProfile(userId: string, data: Partial<UserData>): void {
        console.log("save profile")
        const currentProfile = db.userProfile(userId);
        if (!currentProfile) return;

        db.updateProfileInfo(
            data.login ?? currentProfile.login,
            data.username ?? currentProfile.display_name,
            userId
        );
    }

    /**
     * Обновить аватар пользователя
     * @param userId ID пользователя
     * @param photoUrl URL нового аватара
     * TODO: Заменить на реальный HTTP запрос POST /api/users/{userId}/avatar
     */
    static updateUserAvatar(userId: string, photoUrl: string): void {
        db.updateUserProfilePhoto(photoUrl, userId);
    }

    /**
     * Изменить пароль пользователя
     * @param userId ID пользователя
     * @param oldPassword Старый пароль
     * @param newPassword Новый пароль
     * TODO: Заменить на реальный HTTP запрос POST /api/users/{userId}/change-password
     */
    static changePassword(userId: string, oldPassword: string, newPassword: string): void {
        // В реальном приложении здесь была бы проверка старого пароля
        db.updatePassword(newPassword, userId);
    }

    static becomeCreator(userId: string, name: string, description: string): void {
        const creatorId = Math.random().toString(36).substr(2, 9);
        db.becameCreator(creatorId, userId, name, description);
    }
}
