import React, { useState, useEffect } from 'react';
import { Box, Container, Snackbar, Alert, Card, Typography } from '@mui/material';
import { UserData } from '../types/user';
import UserSettingsTab from '../components/UserSettings/UserSettingsTab';
import { UserService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

interface UserSettingsPageProps {
    
}

/**
 * Страница настроек пользователя
 */
const UserSettingsPage: React.FC<UserSettingsPageProps> = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Функция для обновления данных пользователя из базы
  const refreshUserData = () => {
    if (user?.id) {
      const profile = UserService.getUserProfile(user.id);
      if (profile) {
        setUserData(profile);
      }
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [user?.id]);

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

    if (!userData) {
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
              userData={userData}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleChangePassword}
              onUpdateAvatar={handleUpdateAvatar}
            />
          </Box>
        </Card>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  };

  // Обработчик закрытия уведомления
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Показать уведомление
  const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Обработчик обновления профиля
  const handleUpdateProfile = async (data: Partial<UserData>): Promise<void> => {
    if (!user?.id || !userData) return;

    try {
      // Обновляем локальное состояние
      const updatedData = {
        ...userData,
        ...data
      };
      setUserData(updatedData);

      // Обновляем данные в AuthContext
      updateUser({
        username: data.username ?? userData.username,
        login: data.login ?? userData.login,
        avatar: data.avatar ?? userData.avatar
      });

      // Обновляем данные в моковой БД
      UserService.updateUserProfile(user.id, data);
      
      // Обновляем данные из базы
      refreshUserData();
      
      showNotification('Профиль успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      showNotification('Ошибка при обновлении профиля', 'error');
      
      // Перезагружаем текущие данные из базы
      const currentProfile = UserService.getUserProfile(user.id);
      if (currentProfile) {
        setUserData(currentProfile);
      }
    }
  };

  // Обработчик изменения пароля
  const handleChangePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    if (!user?.id || !userData) return;

    try {
      // Обновляем локальное состояние
      setUserData(userData); // Пароль не влияет на отображаемые данные

      // Обновляем пароль в моковой БД
      UserService.changePassword(user.id, oldPassword, newPassword);
      
      // Обновляем данные из базы
      refreshUserData();
      
      showNotification('Пароль успешно изменен', 'success');
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error);
      showNotification('Ошибка при изменении пароля', 'error');
      
      // Перезагружаем текущие данные из базы
      const currentProfile = UserService.getUserProfile(user.id);
      if (currentProfile) {
        setUserData(currentProfile);
      }
    }
  };

  // Обработчик обновления аватара
  const handleUpdateAvatar = async (file: File): Promise<void> => {
    if (!user?.id || !userData) return;

    try {
      // Создаем URL для файла
      const fileUrl = URL.createObjectURL(file);
      
      // Обновляем локальное состояние
      const updatedData = {
        ...userData,
        avatar: fileUrl
      };
      setUserData(updatedData);

      // Обновляем данные в AuthContext
      updateUser({
        username: userData.username,
        login: userData.login,
        avatar: fileUrl
      });

      // Обновляем аватар в моковой БД
      UserService.updateUserAvatar(user.id, fileUrl);
      
      // Обновляем данные из базы
      refreshUserData();
      
      showNotification('Аватар успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      showNotification('Ошибка при обновлении аватара', 'error');
      
      // Перезагружаем текущие данные из базы
      const currentProfile = UserService.getUserProfile(user.id);
      if (currentProfile) {
        setUserData(currentProfile);
      }
    }
  };

  return renderContent();
};

export default UserSettingsPage;
