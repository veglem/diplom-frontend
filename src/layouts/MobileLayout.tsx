import React, { act, ReactNode, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  IconButton,
  styled,
  Stack
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Favorite';
import ContactsIcon from '@mui/icons-material/Settings';
import BaseLayout from './BaseLayout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';

// Интерфейс для пропсов макета мобильных устройств
interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * Макет для мобильных устройств
 * Содержит выдвижное меню и нижнюю навигацию
 */
const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  cursor: 'pointer',
  '&:hover .avatar': {
    filter: 'brightness(50%)',
  },
  '&:hover .logout-icon': {
    opacity: 1,
  },
}));

const LogoutIconStyled = styled(ContactsIcon)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  pointerEvents: 'none',
}));

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
}) => {
  let navigate = useNavigate();
  const { user, selfAuthorId } = useAuth();
  const {lang} = useLanguage();

  const handleLogout = () => {
    navigate('/settings/profile');
  };

  return (
    <BaseLayout>
      {/* Верхняя панель */}
      <AppBar position="fixed" sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>

          </Typography>
          {user && (
            <Stack direction='row' spacing={2} alignItems='center'>
              <Typography>{user.username}</Typography>
              <AvatarWrapper onClick={handleLogout}>
              <Avatar
                src={user.avatar}
                alt={user.username}
                className="avatar"
                sx={{
                  width: 40,
                  height: 40,
                  transition: 'filter 0.3s ease',
                }}
              >
                {user.username?.charAt(0)}
              </Avatar>
              <LogoutIconStyled className="logout-icon" />
            </AvatarWrapper>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Основное содержимое */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          marginTop: '120px', // Высота AppBar + Header
          marginBottom: '56px', // Высота BottomNavigation
        }}
      >
        <Container maxWidth="sm">
          {children}
        </Container>
      </Box>

      {/* Нижняя навигация */}
      <BottomNavigation
        value={useLocation().pathname}
        onChange={(event, newValue) => {
          navigate(newValue)
          console.log(newValue);
        }}
        showLabels
        sx={{
          width: '100%',
          position: 'fixed',
          bottom: 0,
          left: 0,
          boxShadow: 3,
        }}
      >
        <BottomNavigationAction value="/" label={lang.MAIN_PAGE} icon={<HomeIcon />} />
        <BottomNavigationAction value="/subscribtions" label={lang.SUBSCRIPTIONS} icon={<InfoIcon />} />
        {selfAuthorId != null && (<BottomNavigationAction value={`/author/${selfAuthorId}`} label={lang.MY_PAGE} icon={<AccountCircleIcon />} />)}
      </BottomNavigation>
    </BaseLayout>
  );
};

export default MobileLayout;
