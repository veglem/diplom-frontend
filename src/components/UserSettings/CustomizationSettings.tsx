import React from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography, useColorScheme, useMediaQuery, useTheme, withTheme } from "@mui/material";
import { useDevice } from "../../utils/DeviceContext";
import themes from "../../theme";
import { ThemePaletteModeContext } from "../../App";

interface CustomizationSettingsProps {
}

const CustomizationSettings: React.FC<CustomizationSettingsProps> = () => {
    const theme = useTheme();
    const { isMobile } = useDevice();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const themePaletteModeContext = React.useContext(ThemePaletteModeContext)

    const handleThemeUpdate = (e: SelectChangeEvent) => {
        if (e.target.value == 'Light Blue') {
            themePaletteModeContext.setThemeMode('lb');
        } else {
            themePaletteModeContext.setThemeMode('db');
        }
    }

    let themeName = 'Light Blue';
    if (theme.palette.primary === themes.lb.palette.primary) {
        themeName = 'Light Blue';
    } else {
        themeName = 'Dark Blue'
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
                Настройки оформления
            </Typography>
            
            {/* Здесь будут настройки оформления */}

            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Тема</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={themeName}
                    label="Age"
                    onChange={handleThemeUpdate}
                >
                    <MenuItem value={'Light Blue'}>Light Blue</MenuItem>
                    <MenuItem value={'Dark Blue'}>Dark Blue</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default CustomizationSettings;
