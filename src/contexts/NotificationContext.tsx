import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, Snackbar } from '@mui/material';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info',
  });

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({
      open: true,
      message,
      type,
    });
  }, []);

  const handleClose = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
