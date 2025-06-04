import React, { useState } from 'react';
import { Box, IconButton, Modal, Typography, Button } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import { useLanguage } from '../../contexts/LanguageContext';
import { HeadImage } from './HeadImage';
import HeadImageCropModal from './HeadImageCropModal';
import ImageUploadModal from './ImageUploadModal';

interface EditableHeadImageProps {
    src: string;
    isMobile: boolean;
    onUpdate: (newImage: File) => void;
    onDelete: () => void;
}

export const EditableHeadImage: React.FC<EditableHeadImageProps> = ({ 
    src, 
    isMobile, 
    onUpdate, 
    onDelete 
}) => {
    const { lang } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleOpenDeleteModal = () => setDeleteModalOpen(true);
    const handleCloseDeleteModal = () => setDeleteModalOpen(false);
    const handleOpenUploadModal = () => setUploadModalOpen(true);
    const handleCloseUploadModal = () => setUploadModalOpen(false);
    const handleCloseCropModal = () => setCropModalOpen(false);

    const handleDelete = () => {
        onDelete();
        handleCloseDeleteModal();
    };

    const handleImageSelect = (file: File) => {
        setSelectedFile(file);
        handleCloseUploadModal();
        setCropModalOpen(true);
    };

    const handleCropSave = (croppedFile: File) => {
        onUpdate(croppedFile);
        handleCloseCropModal();
        setSelectedFile(null);
    };

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{ position: 'relative' }}
        >
            <HeadImage src={src} />
            
            {(isHovered || isMobile) && (
                <Box sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    display: 'flex', 
                    flexDirection: 'row',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    padding: '4px'
                }}>
                    <IconButton 
                        onClick={handleOpenUploadModal} 
                        aria-label="edit"
                        size="small"
                    >
                        <EditIcon />
                    </IconButton>
                </Box>
            )}

            {/* Delete Modal */}
            <Modal
                open={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                aria-labelledby="delete-modal-title"
                aria-describedby="delete-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="delete-modal-title" variant="h6" component="h2">
                        {lang.DELETE_CONFIRMATION}
                    </Typography>
                    <Typography id="delete-modal-description" sx={{ mt: 2 }}>
                        {lang.DELETE_IMAGE_CONFIRMATION}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                        <Button onClick={handleCloseDeleteModal} variant="contained" color="primary">
                            {lang.CANCEL}
                        </Button>
                        <Button onClick={handleDelete} variant="contained" color="error">
                            {lang.DELETE}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Upload Modal */}
            <ImageUploadModal
                open={uploadModalOpen}
                onClose={handleCloseUploadModal}
                onImageSelect={handleImageSelect}
            />

            {/* Crop Modal */}
            <HeadImageCropModal
                open={cropModalOpen}
                onClose={handleCloseCropModal}
                imageFile={selectedFile || new File([src], 'current.jpg', { type: 'image/jpeg' })}
                onSave={handleCropSave}
            />
        </Box>
    );
};
