import React from 'react';
import SubscriptionLevelCard, { SubscriptionLevel } from './SubscriptionLevelCard';
import { Box, Button } from "@mui/material";

interface NonEditableSubscriptionLevelCardProps {
    level: SubscriptionLevel;
    isMobile: boolean;
    onSubscribe: (id: string) => void;
}

const NonEditableSubscriptionLevelCard: React.FC<NonEditableSubscriptionLevelCardProps> = ({ level, isMobile, onSubscribe }) => {
    return (
        <SubscriptionLevelCard level={level} isMobile={isMobile}>
            <Box sx={{ mt: 2 }}>
                <Button variant="outlined" fullWidth onClick={() => onSubscribe(level.id)}>
                    Подписаться
                </Button>
            </Box>
        </SubscriptionLevelCard>
    );
};

export default NonEditableSubscriptionLevelCard;
