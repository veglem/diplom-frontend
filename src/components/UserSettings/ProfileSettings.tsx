import { Box, IconButton, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, useTheme } from "@mui/material";
import React, { useState } from "react";
import { UserData } from "../../types/user";
import { useDevice } from "../../utils/DeviceContext";
import CloseIcon from '@mui/icons-material/Close';
import PasswordChangeModal from "./PasswordChangeModal";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import { UserService } from "../../services/userService";
import BecomeAuthorModal from "./BecomeAuthorModal";
import { EditableAvatar } from "../Avatar/EditableAvatar";

interface ProfileSettingsProps {
    userData: UserData;
    onUpdateProfile: (data: Partial<UserData>) => Promise<void>;
    onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    onUpdateAvatar: (file: File) => Promise<void>;
}

// Интерфейс для модального окна изменения текстового поля
interface TextFieldModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    label: string;
    value: string;
    onSave: (value: string) => Promise<void>;
}

// Компонент модального окна для изменения текстового поля
const TextFieldModal: React.FC<TextFieldModalProps> = ({
    open,
    onClose,
    title,
    label,
    value,
    onSave
}) => {
    const [localValue, setLocalValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  

    const handleClose = () => {
        setLocalValue(value);
        onClose();
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSave(localValue);
            onClose();
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            setLocalValue(value); // Восстанавливаем предыдущее значение при ошибке
        } finally {
            setIsLoading(false);
        }
    };

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
                {title}
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
                <TextField
                    autoFocus
                    margin="normal"
                    label={label}
                    fullWidth
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    size={isSmallScreen ? "small" : "medium"}
                />
            </DialogContent>

            <DialogActions sx={{ px: isSmallScreen ? 2 : 3, pb: isSmallScreen ? 2 : 3 }}>
                <Button
                    onClick={handleClose}
                    color="inherit"
                    size={isSmallScreen ? "small" : "medium"}
                >
                    Отмена
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    size={isSmallScreen ? "small" : "medium"}
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Хелпер для создания URL из File
const createFileUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
    userData,
    onUpdateProfile,
    onChangePassword,
    onUpdateAvatar
}) => {
    const theme = useTheme();
    const { isMobile } = useDevice();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { logout, user, updateUser, becomeAuthor } = useAuth();
    const navigate = useNavigate();


    // Состояния для модальных окон
    const [usernameModalOpen, setUsernameModalOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [becomeAuthorModalOpen, setBecomeAuthorModalOpen] = useState(false);
    
    // Обработчик сохранения имени пользователя
    const handleSaveUsername = async (newUsername: string) => {
        if (newUsername === userData.username) {
            return;
        }
        await onUpdateProfile({ username: newUsername });
    };

    // Обработчик сохранения логина
    const handleSaveLogin = async (newLogin: string) => {
        if (newLogin === userData.login) {
            return;
        }
        await onUpdateProfile({ login: newLogin });
    };

    const handleLogout = () => {
        navigate('/');
        logout();
    }

    return (
        <Box>
            <Typography 
                variant="h6" 
                component="h2" 
                gutterBottom
                sx={{ 
                    fontWeight: 500,
                    mb: 3
                }}
            >
                Настройки профиля
            </Typography>

            {/* Аватар */}
            <Box
                display='flex'
                justifyContent='center'
                sx={{
                    position: 'relative',
                    mb: 3,
                }}
            >
                <EditableAvatar src={userData.avatar ?? ''} username={userData.username} onAvatarUpload={onUpdateAvatar} size='small' />
            </Box>

            {/* Имя пользователя */}
            <Box sx={{ mb: 2 }}>
                <Typography 
                    variant="subtitle2"
                    color="text.secondary" 
                    gutterBottom
                    sx={{ mb: 1 }}
                >
                    Имя пользователя
                </Typography>
                
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setUsernameModalOpen(true)}
                    sx={{
                        justifyContent: 'space-between',
                        textTransform: 'none',
                        py: 1.5,
                        px: 2
                    }}
                >
                    <Typography variant="body1" color="text.primary">
                        {userData.username}
                    </Typography>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </Button>
            </Box>
            
            {/* Логин */}
            <Box sx={{ mb: 2 }}>
                <Typography 
                    variant="subtitle2"
                    color="text.secondary" 
                    gutterBottom
                    sx={{ mb: 1 }}
                >
                    Логин
                </Typography>
                
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setLoginModalOpen(true)}
                    sx={{
                        justifyContent: 'space-between',
                        textTransform: 'none',
                        py: 1.5,
                        px: 2
                    }}
                >
                    <Typography variant="body1" color="text.primary">
                        {userData.login}
                    </Typography>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </Button>
            </Box>
            
            {/* Пароль */}
            <Box sx={{ mb: 2 }}>
                <Typography 
                    variant="subtitle2"
                    color="text.secondary" 
                    gutterBottom
                    sx={{ mb: 1 }}
                >
                    Пароль
                </Typography>
                
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setPasswordModalOpen(true)}
                    sx={{
                        justifyContent: 'space-between',
                        textTransform: 'none',
                        py: 1.5,
                        px: 2
                    }}
                >
                    <Typography variant="body1" color="text.primary">
                        ••••••••
                    </Typography>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </Button>
            </Box>
            {user && !user.isAuthor && (
                <Box>
                    <Button onClick={() => setBecomeAuthorModalOpen(true)} color='primary'>Стать автором</Button>
                </Box>
            )}
            <Box>
                <Button onClick={handleLogout} color='error'>Выйти</Button>
            </Box>
            
            <BecomeAuthorModal
                open={becomeAuthorModalOpen}
                onClose={() => setBecomeAuthorModalOpen(false)}
                onSubmit={async (name, description) => {
                    if (user) {
                        becomeAuthor(name, description)

                        setBecomeAuthorModalOpen(false);
                    }
                }}
            />

            {/* Модальное окно изменения имени пользователя */}
            <TextFieldModal
                open={usernameModalOpen}
                onClose={() => setUsernameModalOpen(false)}
                title="Изменение имени пользователя"
                label="Имя пользователя"
                value={userData.username}
                onSave={handleSaveUsername}
            />

            {/* Модальное окно изменения логина */}
            <TextFieldModal
                open={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                title="Изменение логина"
                label="Логин"
                value={userData.login}
                onSave={handleSaveLogin}
            />

            {/* Модальное окно изменения пароля */}
            <PasswordChangeModal
                open={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                onSubmit={onChangePassword}
            />
        </Box>
    );
}

export default ProfileSettings;
