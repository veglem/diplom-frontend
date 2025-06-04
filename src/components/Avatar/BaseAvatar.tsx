import { Avatar } from "@mui/material";
import React from "react";

export interface BaseAvatarProps {
    src: string;
    username: string;
    size: 'small' | 'small-L' | 'medium';
}

export const BaseAvatar: React.FC<BaseAvatarProps> = ({src, username, size = 'small'}) => {
    let sizePx = size == 'small' ? 100 : 200
    if (size == 'small-L') {
        sizePx = 120
    }
    return <>
        <Avatar src={src != '' ? `/images/user/${src}.jpg` : ''} alt={username} sx={{width: sizePx, height: sizePx, fontSize: '2.5rem'}}>
            { username.charAt(0).toUpperCase()}
        </Avatar>
    </>
}