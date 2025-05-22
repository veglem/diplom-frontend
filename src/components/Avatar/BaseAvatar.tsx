import { Avatar } from "@mui/material";
import React from "react";

export interface BaseAvatarProps {
    src: string;
    username: string;
    size: 'small' | 'medium';
}

export const BaseAvatar: React.FC<BaseAvatarProps> = ({src, username, size = 'small'}) => {
    const sizePx = size == 'small' ? 100 : 200
    return <>
        <Avatar src={src} alt={username} sx={{width: sizePx, height: sizePx, fontSize: '2.5rem'}}>
            {username.charAt(0).toUpperCase()}
        </Avatar>
    </>
}