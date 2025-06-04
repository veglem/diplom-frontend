import { Box, Divider, Stack, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { UserData } from "../../types/user";
import ProfileSettings from "./ProfileSettings";
import NotificationSettings from "./NotificationSettings";
import CustomizationSettings from "./CustomizationSettings";
import { useDevice } from "../../utils/DeviceContext";
import theme from "../../theme";
import { Outlet, useNavigate } from "react-router";
import { useLocation } from "react-router";
import { useLanguage } from "../../contexts/LanguageContext";

export interface UserSettingsTabProps {
    userData: UserData;
    onUpdateProfile: (data: Partial<UserData>) => Promise<void>;
    onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    onUpdateAvatar: (file: File) => Promise<void>;
}

const UserSettingsTab: React.FC<UserSettingsTabProps> = ({
    userData,
    onUpdateProfile,
    onChangePassword,
    onUpdateAvatar,
}) => {
    const navigate = useNavigate();

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        navigate(newValue);
    };

    const theme = useTheme();
    const { isMobile } = useDevice();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const {lang} = useLanguage();
    const location = useLocation();

    // let activeTab;

    // switch (tabNum) {
    //     case 0:
    //         activeTab = <ProfileSettings
    //             onChangePassword={onChangePassword}
    //             onUpdateAvatar={onUpdateAvatar}
    //             onUpdateProfile={onUpdateProfile}
    //             userData={userData}
    //         />
    //         break;
    //     case 1:
    //         activeTab = <NotificationSettings
    //             userData={userData}
    //             onUpdateProfile={onUpdateProfile}
    //         />
    //         break;
    //     case 2:
    //         activeTab = <CustomizationSettings
    //         />
    //         break;
    //     default:
    //         activeTab = <ProfileSettings
    //             onChangePassword={onChangePassword}
    //             onUpdateAvatar={onUpdateAvatar}
    //             onUpdateProfile={onUpdateProfile}
    //             userData={userData}
    //         />
    // }

    return (
        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={0} divider={<Divider orientation={isSmallScreen ? 'horizontal' : 'vertical'} flexItem />} width='100%'>
            <Tabs 
                orientation= {isSmallScreen ? "horizontal" : "vertical"}
                value={location.pathname.split('/').slice(-1)[0]}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab label={lang.PROFILE} value="profile" />
                {/* <Tab label="Уведомления" value="notifications" /> */}
                <Tab label={lang.CUSTOMIZATION} value="customization" />
            </Tabs>
            <Box margin={4} display='flex' flexDirection='row' justifyContent='center' width='70%'>
                <Outlet context={{userData, onUpdateProfile, onChangePassword, onUpdateAvatar} as UserSettingsTabProps}></Outlet>
                {/* {activeTab} */}
            </Box>


        </Stack>
    );
}

export default UserSettingsTab;
