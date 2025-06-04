import React, { useState } from "react";
import { BaseAvatar, BaseAvatarProps } from "./BaseAvatar";
import IconButton from "@mui/material/IconButton";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import ImageCropModal from "../UserSettings/ImageCropModal";
import {v4 as uuidv4} from "uuid"
import { Box } from "@mui/material";

interface EditableAvatarProps extends BaseAvatarProps {
    onAvatarUpload: (file: File) => Promise<void>
}

export const EditableAvatar: React.FC<EditableAvatarProps> = ({ src, username, size = 'small', onAvatarUpload }) => {
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    let sizePx = size == 'small' ? 100 : 200
    if (size == 'small-L') {
        sizePx = 120
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setCropModalOpen(true);
        }
    };

    const handleCropSave = async (croppedImage: string) => {
        // Преобразуем URL в File
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const file = new File([blob], `avatar-${uuidv4()}.jpg`, { type: 'image/jpeg' });

        await onAvatarUpload(file);

        // Очищаем временные данные
        if (selectedImage) {
            URL.revokeObjectURL(selectedImage);
        }
        URL.revokeObjectURL(croppedImage);
        setSelectedImage(null);
    };

    return <Box sx={{position: 'relative'}}>
        <BaseAvatar src={src} username={username} size={size}></BaseAvatar>
        <IconButton
            aria-label="change avatar"
            component="label"
            sx={{
                position: 'absolute',
                bottom: -8,
                right: 8,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                    backgroundColor: 'primary.dark',
                },
            }}
            size="small"
        >
            <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleAvatarUpload}
            />
            <PhotoCameraIcon fontSize="small" />
        </IconButton>
        {selectedImage && (
            <ImageCropModal
                open={cropModalOpen}
                onClose={() => {
                    setCropModalOpen(false);
                    if (selectedImage) {
                        URL.revokeObjectURL(selectedImage);
                    }
                    setSelectedImage(null);
                }}
                imageUrl={selectedImage}
                onSave={handleCropSave}
            />
        )}
    </Box>
}