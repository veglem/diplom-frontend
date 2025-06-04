import React, { useEffect, useState } from 'react';
import SubscriptionLevelCard, { SubscriptionLevel } from './SubscriptionLevelCard';
import { Box, Button } from "@mui/material";
import SubscriptionPaymentModal from './SubscriptionPaymentModal';
import { useAuth } from '../../contexts/AuthContext';
import { writerService } from '../../services/writerService';
import { useLanguage } from '../../contexts/LanguageContext';

interface NonEditableSubscriptionLevelCardProps {
    level: SubscriptionLevel;
    isMobile: boolean;
}

const NonEditableSubscriptionLevelCard: React.FC<NonEditableSubscriptionLevelCardProps> = ({ level, isMobile }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const {user} = useAuth();
    const { lang } = useLanguage();

    const [isSubBought, setIsSubBought] = useState<boolean>(true)

    useEffect(() => {
        const f = async () => {
            if (user ) {
                const sub = (await writerService.getUserSubLevels(user?.id)).find(userLevel => {
                    return level.id === userLevel?.subscription_id
                });
                if (sub == null || sub == undefined ) {
                    setIsSubBought(false);
                } else {
                    setIsSubBought(true);
                }
            }
        }
        f()
    })

    const handleOpenPaymentModal = () => {
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
    };

    if (!isSubBought && !level.is_avalible) {
        return <></>
    }

    return (
        <>
            <SubscriptionLevelCard level={level} isMobile={isMobile}>
                <Box sx={{ mt: 2 }}>
                    <Button disabled={isSubBought} variant="outlined" fullWidth onClick={handleOpenPaymentModal}>
                        {lang.SUBSCRIBE}
                    </Button>
                </Box>
            </SubscriptionLevelCard>

            <SubscriptionPaymentModal
                open={isPaymentModalOpen}
                onClose={handleClosePaymentModal}
                subscriptionLevel={level}
            />
        </>
    );
};

export default NonEditableSubscriptionLevelCard;
