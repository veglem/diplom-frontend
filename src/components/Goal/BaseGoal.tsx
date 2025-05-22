import { Box, LinearProgress, Typography } from "@mui/material";

interface Goal {
    current: number; 
    target: number;
}

interface GoalProps {
    goal: Goal;
    isMobile: boolean;
}

export const BaseGoal: React.FC<GoalProps> = ({ goal, isMobile }) => {
    const progress = (goal.current / goal.target) * 100;

    return (
        <Box sx={{ mt: isMobile ? 2 : 4, mb: isMobile ? 2 : 4 }}>
            <Typography variant="subtitle1" gutterBottom>
                Цель
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {goal.current} из {goal.target}
                </Typography>
                <Typography variant="body2">
                    {progress.toFixed(0)}%
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={progress}
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