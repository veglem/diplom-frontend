import React, { useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, useTheme, useMediaQuery, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useLanguage } from '../../contexts/LanguageContext';

interface ImageUploadModalProps {
    open: boolean;
    onClose: () => void;
    onImageSelect: (file: File) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
    open,
    onClose,
    onImageSelect
}) => {
    const { lang } = useLanguage();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            onImageSelect(file);
        } else {
            // Можно добавить обработку ошибки, если файл не является изображением
            console.error(lang.FILE_NOT_IMAGE);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            fullScreen={isSmallScreen}
        >
            <DialogTitle sx={{
                py: isSmallScreen ? 1.5 : 2,
                fontSize: isSmallScreen ? '1.1rem' : '1.25rem'
            }}>
                {lang.IMAGE_UPLOAD}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    size={isSmallScreen ? "small" : "medium"}
                    sx={{
                        position: 'absolute',
                        right: isSmallScreen ? 4 : 8,
                        top: isSmallScreen ? 4 : 8,
                        color: (theme) => theme.palette.grey[500],
                        padding: isSmallScreen ? 0.5 : 1,
                    }}
                >
                    <CloseIcon fontSize={isSmallScreen ? "small" : "medium"} />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        border: '2px dashed',
                        borderColor: dragActive ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: dragActive ? 'action.hover' : 'background.paper',
                        transition: 'all 0.2s ease',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                        }
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                    />
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" component="div" gutterBottom>
                        {lang.DRAG_IMAGE_HERE}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {lang.OR_CLICK_TO_SELECT}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: isSmallScreen ? 2 : 3, pb: isSmallScreen ? 2 : 3 }}>
                <Button
                    onClick={onClose}
                    color="inherit"
                    size={isSmallScreen ? "small" : "medium"}
                >
                    {lang.CANCEL}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageUploadModal;
