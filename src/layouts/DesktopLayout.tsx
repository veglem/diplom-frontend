import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Drawer, 
  List, 
  ListItemIcon, 
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  ListItemButton,
  useTheme,
  Avatar,
  styled,
  Stack
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import BaseLayout from './BaseLayout';
import UserSettings, { mockUserData } from '../components/UserSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// Ширина боковой панели
const DRAWER_WIDTH_OPEN = 240;
const DRAWER_WIDTH_CLOSED = 64;

// Интерфейс для пропсов макета десктопа
interface DesktopLayoutProps {
  children: ReactNode;
  title?: string;
}

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

const LogoutIconStyled = styled(SettingsIcon)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  pointerEvents: 'none',
}));

/**
 * Макет для десктопных устройств
 * Содержит боковую панель навигации и верхнюю панель
 */
const DesktopLayout: React.FC<DesktopLayoutProps> = ({ 
  children, 
}) => {
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const { user, selfAuthorId } = useAuth();
  let navigate = useNavigate();
  const {lang} = useLanguage();

  const handleLogout = () => {
    navigate('/settings/profile');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <BaseLayout>
      {/* Верхняя панель */}
      <AppBar
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2}}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            
          </Typography>
          {user && (
            <Stack direction='row' spacing={2} alignItems='center'>
              <Typography variant='h6'>{user.username}</Typography>
              <AvatarWrapper onClick={handleLogout}>
              <Avatar
                src={user.avatar != null ? `/images/user/${user.avatar}.jpg` : ''}
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

      {/* Боковая панель */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED,
            boxSizing: 'border-box',
            top: '64px', // Высота AppBar
            height: 'calc(100% - 64px)',
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <List>
          <Tooltip title={!drawerOpen ? lang.MAIN_PAGE : ""} placement="right">
            <ListItemButton sx={{ justifyContent: 'flex-start', px: 2 , height: '4em'}} onClick={() => {navigate("/")}}>
              <ListItemIcon sx={{ minWidth: drawerOpen ? 36 : 'auto', mr: drawerOpen ? 2 : 0, margin: '0.25em'}}>
                <HomeIcon color='primary' />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary={lang.MAIN_PAGE} />}
            </ListItemButton>
          </Tooltip>
          
          <Tooltip title={!drawerOpen ? lang.SUBSCRIPTIONS : ""} placement="right">
            <ListItemButton sx={{ justifyContent: 'flex-start', px: 2 , height: '4em'}} onClick={() => {navigate("/subscribtions")}}>
              <ListItemIcon sx={{ minWidth: drawerOpen ? 36 : 'auto', mr: drawerOpen ? 2 : 0, margin: '0.25em'}}>
                <FavoriteIcon color='primary' />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary={lang.SUBSCRIPTIONS} />}
            </ListItemButton>
          </Tooltip>
          
          {selfAuthorId != null && (<Tooltip title={!drawerOpen ? lang.MY_PAGE : ""} placement="right">
            <ListItemButton sx={{ justifyContent: 'flex-start', px: 2 , height: '4em'}} onClick={() => {navigate(`/author/${selfAuthorId}`)}}>
              <ListItemIcon sx={{ minWidth: drawerOpen ? 36 : 'auto', mr: drawerOpen ? 2 : 0, margin: '0.25em'}}>
                <AccountCircleIcon color='primary' />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary={lang.MY_PAGE} />}
            </ListItemButton>
          </Tooltip>)}
        </List>
        <Divider />
      </Drawer>

      {/* Основное содержимое */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          marginTop: '56px', // Высота AppBar для мобильных
          marginBottom: '56px', // Высота BottomNavigation
          transitionProperty: 'margin-left',
          transitionDuration: '0.225s',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
          marginLeft: drawerOpen ? `${DRAWER_WIDTH_OPEN}px` : `${DRAWER_WIDTH_CLOSED}px`
        }}
        
      >
        <Container>
          {children}
        </Container>
      </Box>
    </BaseLayout>
  );
};

export default DesktopLayout;
