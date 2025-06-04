import { Box, Button } from "@mui/material";
import React, { useState } from "react";
import ImageUploadModal from "./ImageUploadModal";
import HeadImageCropModal from "./HeadImageCropModal";
import { useLanguage } from '../../contexts/LanguageContext';

interface CreateHeadImageButtonProps {
    onUploadCover: (file: File) => Promise<void>;
}

export const CreateHeadImageButton: React.FC<CreateHeadImageButtonProps> = ({onUploadCover}) => {
    const { lang } = useLanguage();
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleOpenUploadModal = () => setUploadModalOpen(true);
    const handleCloseUploadModal = () => setUploadModalOpen(false);
    const handleCloseCropModal = () => setCropModalOpen(false);

    const handleImageSelect = (file: File) => {
        setSelectedFile(file);
        handleCloseUploadModal();
        setCropModalOpen(true);
    };

    const handleCropSave = (croppedFile: File) => {
        onUploadCover(croppedFile);
        handleCloseCropModal();
        setSelectedFile(null);
    };

    return <Box display='flex'>
        <Button onClick={handleOpenUploadModal}>{lang.ADD_PROFILE_HEADER}</Button>
        <ImageUploadModal open={uploadModalOpen} onClose={handleCloseUploadModal} onImageSelect={handleImageSelect}></ImageUploadModal>
        <HeadImageCropModal open={cropModalOpen} onClose={handleCloseCropModal} imageFile={selectedFile || new File([], 'current.jpg', { type: 'image/jpeg' })} onSave={handleCropSave}/>
    </Box>
}
