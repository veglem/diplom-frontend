import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useLanguage } from '../../contexts/LanguageContext';

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => Promise<void>;
}

/**
 * Модальное окно для изменения пароля пользователя
 */
const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  // Состояния для полей ввода
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Состояния для отображения ошибок
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Состояния для отображения/скрытия паролей
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(false);
  const {lang} = useLanguage();

  // Обработчик переключения видимости пароля
  const handleTogglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    if (field === 'old') {
      setShowOldPassword(!showOldPassword);
    } else if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Сброс формы
  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOldPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    setIsLoading(false);
  };

  // Обработчик закрытия модального окна
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Валидация формы
  const validateForm = (): boolean => {
    let isValid = true;

    // Проверка старого пароля
    if (!oldPassword) {
      setOldPasswordError(lang.ENTER_CURRENT_PASSWORD);
      isValid = false;
    } else {
      setOldPasswordError('');
    }

    // Проверка нового пароля
    if (!newPassword) {
      setNewPasswordError(lang.ENTER_NEW_PASSWORD);
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError(lang.PASSWORD_MIN_LENGTH);
      isValid = false;
    } else {
      setNewPasswordError('');
    }

    // Проверка подтверждения пароля
    if (!confirmPassword) {
      setConfirmPasswordError(lang.CONFIRM_NEW_PASSWORD);
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError(lang.PASSWORDS_DONT_MATCH);
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(oldPassword, newPassword);
      handleClose();
    } catch (error) {
      // Обработка ошибок от API
      if (error instanceof Error) {
        if (error.message.includes('current password')) {
          setOldPasswordError(lang.INCORRECT_CURRENT_PASSWORD);
        } else {
          setNewPasswordError(lang.PASSWORD_CHANGE_ERROR);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isSmallScreen}
    >
      <DialogTitle sx={{
        py: isSmallScreen ? 1.5 : 2,
        fontSize: isSmallScreen ? '1.1rem' : '1.25rem'
      }}>
        {lang.PASSWORD_CHANGE}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          size={isSmallScreen ? "small" : "medium"}
          sx={{
            position: 'absolute',
            right: isSmallScreen ? 4 : 8,
            top: isSmallScreen ? 4 : 8,
            color: (theme) => theme.palette.grey[500],
            padding: isSmallScreen ? 0.5 : 1,
          }}
        >
          <CloseIcon fontSize={isSmallScreen ? "small" : "medium"} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: isSmallScreen ? 1 : 2 }}>
        <Box sx={{ mt: isSmallScreen ? 0.5 : 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label={lang.CURRENT_PASSWORD}
            type={showOldPassword ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={!!oldPasswordError}
            helperText={oldPasswordError}
            size={isSmallScreen ? "small" : "medium"}
            sx={{
              my: isSmallScreen ? 1 : 2,
              '& .MuiInputLabel-root': {
                fontSize: isSmallScreen ? '0.875rem' : '1rem'
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => handleTogglePasswordVisibility('old')}
                    edge="end"
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    {showOldPassword ? <VisibilityOff fontSize={isSmallScreen ? "small" : "medium"} /> : <Visibility fontSize={isSmallScreen ? "small" : "medium"} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label={lang.NEW_PASSWORD}
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!newPasswordError}
            helperText={newPasswordError}
            size={isSmallScreen ? "small" : "medium"}
            sx={{
              my: isSmallScreen ? 1 : 2,
              '& .MuiInputLabel-root': {
                fontSize: isSmallScreen ? '0.875rem' : '1rem'
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => handleTogglePasswordVisibility('new')}
                    edge="end"
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    {showNewPassword ? <VisibilityOff fontSize={isSmallScreen ? "small" : "medium"} /> : <Visibility fontSize={isSmallScreen ? "small" : "medium"} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label={lang.CONFIRM_NEW_PASSWORD}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
            size={isSmallScreen ? "small" : "medium"}
            sx={{
              my: isSmallScreen ? 1 : 2,
              '& .MuiInputLabel-root': {
                fontSize: isSmallScreen ? '0.875rem' : '1rem'
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => handleTogglePasswordVisibility('confirm')}
                    edge="end"
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    {showConfirmPassword ? <VisibilityOff fontSize={isSmallScreen ? "small" : "medium"} /> : <Visibility fontSize={isSmallScreen ? "small" : "medium"} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: isSmallScreen ? 2 : 3, pb: isSmallScreen ? 2 : 3 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          size={isSmallScreen ? "small" : "medium"}
          sx={{
            fontSize: isSmallScreen ? '0.8125rem' : 'inherit',
            py: isSmallScreen ? 0.5 : 'auto'
          }}
        >
          {lang.CANCEL}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
          size={isSmallScreen ? "small" : "medium"}
          sx={{
            fontSize: isSmallScreen ? '0.8125rem' : 'inherit',
            py: isSmallScreen ? 0.5 : 'auto'
          }}
        >
          {isLoading ? lang.SAVING : lang.SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeModal;
