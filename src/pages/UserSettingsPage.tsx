import React, { useState, useEffect } from 'react';
import { Box, Container, Card, Typography } from '@mui/material';
import { UserData } from '../types/user';
import UserSettingsTab from '../components/UserSettings/UserSettingsTab';
import { UserService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface UserSettingsPageProps {

}

/**
 * Страница настроек пользователя
 */
const UserSettingsPage: React.FC<UserSettingsPageProps> = () => {
  const { user, isAuthenticated, updateUser, updatePassword, updateAvatar } = useAuth();
  const { showNotification } = useNotification();

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <Container maxWidth='lg'>
          <Card variant='outlined'>
            <Box sx={{ my: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <Typography variant="h6" color="text.secondary">
                Необходимо войти в систему
              </Typography>
            </Box>
          </Card>
        </Container>
      );
    }

    if (!user) {
      return (
        <Container maxWidth='lg'>
          <Card variant='outlined'>
            <Box sx={{ my: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <Typography variant="h6" color="text.secondary">
                Загрузка...
              </Typography>
            </Box>
          </Card>
        </Container>
      );
    }

    return (
      <Container maxWidth='lg'>
        <Card variant='outlined'>
          <Box sx={{ my: 4 }}>
            <UserSettingsTab
              userData={user}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleChangePassword}
              onUpdateAvatar={handleUpdateAvatar}
            />
          </Box>
        </Card>
      </Container>
    );
  };

  // Обработчик обновления профиля
  const handleUpdateProfile = async (data: Partial<UserData>): Promise<void> => {
    if (!user?.id || !user) return;

    try {
      // Обновляем локальное состояние
      const updatedData = {
        ...user,
        ...data
      };

      await updateUser(updatedData);
      // Обновляем данные из базы

      showNotification('Профиль успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      showNotification('Ошибка при обновлении профиля', 'error');
    }
  };

  // Обработчик изменения пароля
  const handleChangePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    if (!user?.id || !user) return;

    try {
      // Обновляем пароль в моковой БД
      await updatePassword(oldPassword, newPassword)

      showNotification('Пароль успешно изменен', 'success');
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error);
      showNotification('Ошибка при изменении пароля', 'error');
    }
  };

  // Обработчик обновления аватара
  const handleUpdateAvatar = async (file: File): Promise<void> => {
    if (!user?.id || !user) return;

    try {
      await updateAvatar(file)

      showNotification('Аватар успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      showNotification('Ошибка при обновлении аватара', 'error');
    }
  };

  return renderContent();
};

export default UserSettingsPage;
