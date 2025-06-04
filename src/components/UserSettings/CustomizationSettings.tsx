import React from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography, useColorScheme, useMediaQuery, useTheme, withTheme } from "@mui/material";
import { useDevice } from "../../utils/DeviceContext";
import themes from "../../theme";
import { ThemePaletteModeContext } from "../../App";
import { useLanguage } from "../../contexts/LanguageContext";

interface CustomizationSettingsProps {
}

const CustomizationSettings: React.FC<CustomizationSettingsProps> = () => {
    const theme = useTheme();
    const {setLang, langCode, lang} = useLanguage();
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

    const handleLangUpdate = (e: SelectChangeEvent) => {
        setLang(e.target.value)
        
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
                {lang.CUSTOMIZATION_SETTINGS}
            </Typography>
            
            {/* Здесь будут настройки оформления */}

            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{lang.THEME}</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={themeName}
                    label="Age"
                    onChange={handleThemeUpdate}
                >
                    <MenuItem value={'Light Blue'}>{lang.LIGHT_BLUE}</MenuItem>
                    <MenuItem value={'Dark Blue'}>{lang.DARK_BLUE}</MenuItem>
                </Select>
            </FormControl>

            <Box sx={{py: 2}}></Box>

            <FormControl fullWidth>
                <InputLabel id="lang-simple-select-label">{lang.LANGUAGE}</InputLabel>
                <Select
                    labelId="lang-simple-select-label"
                    id="lang-simple-select"
                    value={langCode}
                    label="Language"
                    onChange={handleLangUpdate}
                >
                    <MenuItem value={'ru'}>{lang.RUSSIAN}</MenuItem>
                    <MenuItem value={'en'}>{lang.ENGLISH}</MenuItem>
                    <MenuItem value={'zh'}>{lang.CHINESE}</MenuItem>
                    <MenuItem value={'sr'}>{lang.SERBIAN}</MenuItem>
                    <MenuItem value={'es'}>{lang.SPANISH}</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default CustomizationSettings;
