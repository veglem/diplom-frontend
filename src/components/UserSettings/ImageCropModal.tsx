import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CloseIcon from '@mui/icons-material/Close';

interface ImageCropModalProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    onSave: (croppedImage: string) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
    open,
    onClose,
    imageUrl,
    onSave
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25
    });
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<string> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    throw new Error('Canvas is empty');
                }
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg');
        });
    };

    const handleSave = async () => {
        if (!imageRef || !crop.width || !crop.height) return;

        setIsLoading(true);
        try {
            const croppedImageUrl = await getCroppedImg(imageRef, crop);
            onSave(croppedImageUrl);
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            fullScreen={isSmallScreen}
        >
            <DialogTitle sx={{
                py: isSmallScreen ? 1.5 : 2,
                fontSize: isSmallScreen ? '1.1rem' : '1.25rem'
            }}>
                Обрезка изображения
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
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: '300px'
                }}>
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCrop(c)}
                        aspect={1}
                        circularCrop
                    >
                        <img 
                            ref={(img) => setImageRef(img)}
                            src={imageUrl} 
                            alt="Загруженное изображение"
                            style={{ maxWidth: '100%', maxHeight: '500px' }}
                        />
                    </ReactCrop>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: isSmallScreen ? 2 : 3, pb: isSmallScreen ? 2 : 3 }}>
                <Button
                    onClick={onClose}
                    color="inherit"
                    size={isSmallScreen ? "small" : "medium"}
                >
                    Отмена
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    size={isSmallScreen ? "small" : "medium"}
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageCropModal;
