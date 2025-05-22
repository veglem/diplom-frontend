import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Paper, 
  Box, 
  Button,
  Chip,
  Container,
} from '@mui/material';
import { useDevice } from '../utils/DeviceContext';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/Auth/LoginModal';
import RegisterModal from '../components/Auth/RegisterModal';

const HomePage: React.FC = () => {
  const { type, width, height, isMobile } = useDevice();
  const { isAuthenticated } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Добро пожаловать!
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          Платформа для создателей контента и их подписчиков
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setLoginModalOpen(true)}
          >
            Войти
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setRegisterModalOpen(true)}
          >
            Зарегистрироваться
          </Button>
        </Box>

        <LoginModal
          open={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
        <RegisterModal
          open={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
        />
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 2, mb: 3}}>
          <Typography variant="body1">
            Текущее устройство: <strong>{type}</strong>
          </Typography>
          <Typography variant="body2">
            Размер экрана: {width} x {height} пикселей
          </Typography>
        </Paper>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: isMobile ? -1 : -1.5 }}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Box 
            key={item} 
            sx={{ 
              width: { 
                xs: '100%', 
                sm: '50%', 
                md: '33.333%' 
              }, 
              padding: isMobile ? 1 : 1.5 
            }}
          >
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Карточка {item}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Это пример контента, который адаптируется под размер экрана.
                  {!isMobile && ' На десктопе отображается больше информации и элементы крупнее.'}
                </Typography>
                
                <Box sx={{ display: 'flex', mt: 2, gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label="React" 
                    color="primary" 
                    size={isMobile ? 'small' : 'medium'} 
                  />
                  <Chip 
                    label="TypeScript" 
                    color="secondary" 
                    size={isMobile ? 'small' : 'medium'} 
                  />
                  <Chip 
                    label="Material UI" 
                    color="info" 
                    size={isMobile ? 'small' : 'medium'} 
                  />
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    size={isMobile ? 'small' : 'medium'}
                  >
                    Подробнее
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Интерфейс автоматически адаптируется под ваше устройство
        </Typography>
      </Box>
    </>
  );
};

export default HomePage;
