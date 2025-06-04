import { Box, Button, Card, CardContent, IconButton, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import React from "react";
import { useLanguage } from '../../contexts/LanguageContext';

// Интерфейс для уровня подписки
export interface SubscriptionLevel {
    id: string;
    title: string;
    price: string;
    description: string;
    is_avalible: boolean;
}

interface SubscriptionLevelCardProps {
    level: SubscriptionLevel;
    isMobile: boolean;
    children?: React.ReactNode;
}

// Компонент карточки уровня подписки
const SubscriptionLevelCard: React.FC<SubscriptionLevelCardProps> = ({ level, isMobile, children }) => {
    const { lang } = useLanguage();
    
    return (
        <Card
            variant="outlined"
            sx={{
                minWidth: isMobile ? 200 : 250,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                margin: 1,
                position: 'relative'
            }}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {level.title}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                    {level.price} {lang.CURRENCY}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {level.description}
                </Typography>
                {children}
            </CardContent>
        </Card>
    );
};

export default SubscriptionLevelCard;
