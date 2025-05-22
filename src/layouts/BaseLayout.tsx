import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';

// Интерфейс для пропсов базового макета
interface BaseLayoutProps {
  children: ReactNode;
}

/**
 * Базовый макет, общий для всех типов устройств
 * Содержит общие элементы, такие как контейнер
 */
const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh'
      }}
    >
      {children}
    </Box>
  );
};

export default BaseLayout;
