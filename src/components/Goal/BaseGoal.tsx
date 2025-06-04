import { Box, LinearProgress, Typography } from "@mui/material";
import { useLanguage } from "../../contexts/LanguageContext";

interface Goal {
    aim: string;
    moneyGot: number;
    moneyNeeded: number;
}

interface GoalProps {
    goal: Goal;
    isMobile: boolean;
}

export const BaseGoal: React.FC<GoalProps> = ({ goal, isMobile }) => {
    const { lang } = useLanguage();
    let progress = goal.moneyGot == 0 && goal.moneyNeeded == 0 ? 0 : (goal.moneyGot / goal.moneyNeeded) * 100;
    if (goal.moneyNeeded == 0 && goal.moneyGot != 0) {
        progress = 100
    }

    return (
        <Box sx={{ mt: isMobile ? 2 : 4, mb: isMobile ? 2 : 4 }}>
            <Typography variant='h6'>{lang.GOAL}</Typography>
            <Typography variant="subtitle1" gutterBottom>
                {goal.aim}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {goal.moneyGot} {lang.GOAL_OF} {goal.moneyNeeded}
                </Typography>
                <Typography variant="body2">
                    {progress.toFixed(0)}%
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={progress > 100 ? 100 : progress}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#4caf50'
                    }
                }}
            />
        </Box>
    );
};
