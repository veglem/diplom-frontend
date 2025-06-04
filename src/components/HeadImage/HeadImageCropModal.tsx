import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CloseIcon from '@mui/icons-material/Close';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeadImageCropModalProps {
    open: boolean;
    onClose: () => void;
    imageFile: File;
    onSave: (croppedImage: File) => void;
}

const HeadImageCropModal: React.FC<HeadImageCropModalProps> = ({
    open,
    onClose,
    imageFile,
    onSave
}) => {
    const { lang } = useLanguage();
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setImageUrl(e.target.result as string);
            }
        };
        reader.readAsDataURL(imageFile);
    }, [imageFile]);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 100,
        height: 40, // Соотношение сторон примерно 2.5:1
        x: 0,
        y: 30
    });
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<File> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error(lang.NO_2D_CONTEXT);
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
                    throw new Error(lang.CANVAS_EMPTY);
                }
                const file = new File([blob], imageFile.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(file);
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
            console.error(lang.ERROR_CROPPING_IMAGE, error);
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
                {lang.HEADER_IMAGE_CROP}
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
                        aspect={2.5} // Соотношение сторон для шапки
                    >
                        <img 
                            ref={(img) => setImageRef(img)}
                            src={imageUrl} 
                            alt={lang.UPLOADED_IMAGE}
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
                    {lang.CANCEL}
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    size={isSmallScreen ? "small" : "medium"}
                >
                    {isLoading ? lang.SAVING : lang.SAVE}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default HeadImageCropModal;
