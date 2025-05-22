import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  Select,
  InputLabel,
  MenuItem,
  FormControl,

} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { UserData, NotificationSettings } from '../../types/user';
import PasswordChangeModal from './PasswordChangeModal';
import { useDevice } from '../../utils/DeviceContext';
import themes from '../../theme';

// Интерфейс для пропсов компонента настроек пользователя
interface UserSettingsProps {
  userData: UserData;
  onUpdateProfile: (data: Partial<UserData>) => Promise<void>;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  onUpdateAvatar: (file: File) => Promise<void>;
  onUpdateTheme: (themeName: string) => void;
}

/**
 * Компонент настроек пользователя
 * Позволяет пользователю изменять свой профиль и настройки уведомлений
 */
const UserSettings: React.FC<UserSettingsProps> = ({
  userData,
  onUpdateProfile,
  onChangePassword,
  onUpdateAvatar,
  onUpdateTheme
}) => {
  const theme = useTheme();
  
  const { isMobile } = useDevice();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Состояния для полей формы
  const [username, setUsername] = useState(userData.username);
  const [login, setLogin] = useState(userData.login);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    userData.notificationSettings
  );
  
  // Состояния для модального окна изменения пароля
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  
  // Состояния для режима редактирования
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingLogin, setIsEditingLogin] = useState(false);
  
  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(false);

  // Обработчик изменения настроек уведомлений
  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    const updatedSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };
    
    setNotificationSettings(updatedSettings);
    
    // Отправляем обновленные настройки на сервер
    onUpdateProfile({
      notificationSettings: updatedSettings
    }).catch(() => {
      // В случае ошибки возвращаем предыдущее состояние
      setNotificationSettings(notificationSettings);
    });
  };

  // Обработчик сохранения имени пользователя
  const handleSaveUsername = async () => {
    if (username === userData.username) {
      setIsEditingUsername(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onUpdateProfile({ username });
      setIsEditingUsername(false);
    } catch (error) {
      // В случае ошибки возвращаем предыдущее значение
      setUsername(userData.username);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик сохранения логина
  const handleSaveLogin = async () => {
    if (login === userData.login) {
      setIsEditingLogin(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onUpdateProfile({ login });
      setIsEditingLogin(false);
    } catch (error) {
      // В случае ошибки возвращаем предыдущее значение
      setLogin(userData.login);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик загрузки аватара
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpdateAvatar(file).catch((error) => {
        console.error('Ошибка при загрузке аватара:', error);
      });
    }
  };

  return (
    <Card variant="elevation" sx={{ 
      mx: 'auto', 
      mb: 4,
      boxShadow: isSmallScreen ? 0 : 1 // Убираем тень на мобильных устройствах
    }}>
      <CardContent>
        <Typography 
          variant="h5"
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 500,
            mb: isSmallScreen ? 2 : 3
          }}
        >
          Настройки профиля
        </Typography>
        
        {/* Аватар и основная информация */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isSmallScreen ? 'column' : 'row',
            alignItems: isSmallScreen ? 'center' : 'flex-start',
            mb: 3 
          }}
        >
          {/* Аватар с возможностью загрузки */}
          <Box 
            sx={{ 
              position: 'relative',
              mb: isSmallScreen ? 2 : 0,
              mr: isSmallScreen ? 0 : 3
            }}
          >
            <Avatar
              src={userData.avatar}
              alt={userData.username}
              sx={{ 
                width: 100, 
                height: 100,
                fontSize: '2.5rem'
              }}
            >
              {userData.username.charAt(0).toUpperCase()}
            </Avatar>
            
            <IconButton
              aria-label="change avatar"
              component="label"
              sx={{
                position: 'absolute',
                right: -8,
                bottom: -8,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
              size="small"
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleAvatarUpload}
              />
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Поля профиля */}
          <Box sx={{ flexGrow: 1, width: '200px'}}>
            {/* Имя пользователя */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2"
                color="text.secondary" 
                gutterBottom
                sx={{ mb: isSmallScreen ? 0.5 : 1 }}
              >
                Имя пользователя
              </Typography>
              
              {isEditingUsername ? (
                <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }} justifyContent='end'>
                  <TextField
                    size="small"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    variant="standard"
                    sx={{ mr: 1, flexGrow: 1, maxWidth: '60%' }}
                    InputProps={{
                      sx: { fontSize: '1rem' }
                    }}
                  />
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={handleSaveUsername}
                    disabled={isLoading}
                    sx={{ p: 0.5 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="inherit"
                    onClick={() => {
                      setUsername(userData.username);
                      setIsEditingUsername(false);
                    }}
                    disabled={isLoading}
                    sx={{ p: 0.5 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </IconButton>
                </Box>
              ) : (
                <Stack direction="row" spacing={1} justifyContent='end'>
                  <Typography variant="body1">{username}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setIsEditingUsername(true)}
                    aria-label="редактировать имя пользователя"
                    sx={{ p: isSmallScreen ? 0.5 : 1 }}
                  >
                    <EditIcon fontSize="medium" />
                  </IconButton>
                </Stack>
              )}
            </Box>
            
            {/* Логин */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2"
                color="text.secondary" 
                gutterBottom
                sx={{ mb: isSmallScreen ? 0.5 : 1 }}
              >
                Логин
              </Typography>
              
              {isEditingLogin ? (
                <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }} justifyContent='end'>
                  <TextField
                    size="small"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    disabled={isLoading}
                    variant="standard"
                    sx={{ mr: 1, flexGrow: 1, maxWidth: '60%' }}
                    InputProps={{
                      sx: { fontSize: '1rem' }
                    }}
                  />
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={handleSaveLogin}
                    disabled={isLoading}
                    sx={{ p: 0.5 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="inherit"
                    onClick={() => {
                      setLogin(userData.login);
                      setIsEditingLogin(false);
                    }}
                    disabled={isLoading}
                    sx={{ p: 0.5 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </IconButton>
                </Box>
              ) : (
                <Stack direction="row" spacing={1} justifyContent='end'>
                  <Typography variant="body1">{login}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setIsEditingLogin(true)}
                    aria-label="редактировать логин"
                    sx={{ p: isSmallScreen ? 0.5 : 1 }}
                  >
                    <EditIcon fontSize="medium" />
                  </IconButton>
                </Stack>
              )}
            </Box>
            
            {/* Пароль */}
            <Box>
              <Typography 
                variant="subtitle2"
                color="text.secondary" 
                gutterBottom
                sx={{ mb: isSmallScreen ? 0.5 : 1 }}
              >
                Пароль
              </Typography>
              
              <Stack direction="row" spacing={1} justifyContent='end'>
                <Typography variant="body1">••••••••</Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setPasswordModalOpen(true)}
                  sx={{ 
                    p: isSmallScreen ? 0.5 : 1 
                  }}
                >
                  <EditIcon fontSize="medium" />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Настройки уведомлений */}
        <Box>
          <Typography 
            variant={isSmallScreen ? "subtitle1" : "h6"} 
            gutterBottom
            sx={{ 
              fontWeight: 500,
              mb: isSmallScreen ? 1.5 : 2
            }}
          >
            Настройки уведомлений
          </Typography>
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.newPosts}
                  onChange={() => handleNotificationChange('newPosts')}
                  color="primary"
                  size="medium"
                />
              }
              label={
                <Typography variant="body1">
                  Новые посты авторов
                </Typography>
              }
              sx={{ mb: isSmallScreen ? 0.5 : 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.news}
                  onChange={() => handleNotificationChange('news')}
                  color="primary"
                  size="medium"
                />
              }
              label={
                <Typography variant="body1">
                  Новости
                </Typography>
              }
              sx={{ mb: isSmallScreen ? 0.5 : 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.commentReplies}
                  onChange={() => handleNotificationChange('commentReplies')}
                  color="primary"
                  size="medium"
                />
              }
              label={
                <Typography variant="body1">
                  Ответы на комментарии
                </Typography>
              }
              sx={{ mb: isSmallScreen ? 0.5 : 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.commentLikes}
                  onChange={() => handleNotificationChange('commentLikes')}
                  color="primary"
                  size="medium"
                />
              }
              label={
                <Typography variant="body1">
                  Лайки комментариев
                </Typography>
              }
              sx={{ mb: isSmallScreen ? 0.5 : 1 }}
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 3 }} />
        <FormControl fullWidth>
          <InputLabel id="theme-selector-label">Тема</InputLabel>
          <Select
            labelId="theme-selector-label"
            id="theme-selector"
            value={theme}
            label="Theme"
            onChange={(e) => {onUpdateTheme(e.target.value as string)}}
            >
            <MenuItem value="db">Dark Blue</MenuItem>
            <MenuItem value="lb">Light Blue</MenuItem>

          </Select>
        </FormControl>
        
      </CardContent>
      
      {/* Модальное окно изменения пароля */}
      <PasswordChangeModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={onChangePassword}
      />
    </Card>
  );
};

// Пример данных пользователя для демонстрации
export const mockUserData: UserData = {
  id: '1',
  username: 'Иван Иванов',
  login: 'ivan_ivanov',
  avatar: 'https://i.pravatar.cc/300',
  notificationSettings: {
    newPosts: true,
    news: false,
    commentReplies: true,
    commentLikes: false
  }
};

export default UserSettings;
