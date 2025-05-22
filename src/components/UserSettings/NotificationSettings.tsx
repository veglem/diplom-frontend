import React, { useState } from "react";
import { Box, Typography, FormGroup, FormControlLabel, Switch, useMediaQuery, useTheme } from "@mui/material";
import { UserData, NotificationSettings as NotificationSettingsType } from "../../types/user";
import { useDevice } from "../../utils/DeviceContext";

interface NotificationSettingsProps {
    userData: UserData;
    onUpdateProfile: (data: Partial<UserData>) => Promise<void>;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    userData,
    onUpdateProfile
}) => {
    const theme = useTheme();
    const { isMobile } = useDevice();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // Состояние для настроек уведомлений
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>(
        userData.notificationSettings
    );

    // Обработчик изменения настроек уведомлений
    const handleNotificationChange = (setting: keyof NotificationSettingsType) => {
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
                    sx={{ mb: isSmallScreen ? 1 : 2 }}
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
                            Новости проекта
                        </Typography>
                    }
                    sx={{ mb: isSmallScreen ? 1 : 2 }}
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
                    sx={{ mb: isSmallScreen ? 1 : 2 }}
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
                    sx={{ mb: isSmallScreen ? 1 : 2 }}
                />
            </FormGroup>
        </Box>
    );
};

export default NotificationSettings;
