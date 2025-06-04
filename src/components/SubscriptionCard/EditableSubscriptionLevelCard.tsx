import React, { useState } from 'react';
import { Box, IconButton, Modal, TextField, Typography, Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SubscriptionLevelCard, { SubscriptionLevel } from './SubscriptionLevelCard';
import { useLanguage } from '../../contexts/LanguageContext';

interface EditableSubscriptionLevelCardProps {
    level: SubscriptionLevel;
    isMobile: boolean;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updatedLevel: SubscriptionLevel) => void;
}

const EditableSubscriptionLevelCard: React.FC<EditableSubscriptionLevelCardProps> = ({ level, isMobile, onDelete, onUpdate }) => {
    const { lang } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editedLevel, setEditedLevel] = useState(level);

    const handleOpenDeleteModal = () => setDeleteModalOpen(true);
    const handleCloseDeleteModal = () => setDeleteModalOpen(false);

    const handleOpenEditModal = () => setEditModalOpen(true);
    const handleCloseEditModal = () => setEditModalOpen(false);

    const handleDelete = () => {
        onDelete(level.id);
        handleCloseDeleteModal();
    };

    const handleUpdate = () => {
        onUpdate(level.id, editedLevel);
        handleCloseEditModal();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedLevel(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{ position: 'relative', alignItems: 'center' }}
        >
            <SubscriptionLevelCard level={editedLevel} isMobile={isMobile} />
            {(isHovered || isMobile) && (
                <Box sx={{ position: 'absolute', top: 5, right: 5, display: 'flex', flexDirection: 'column-reverse' }}>
                    <IconButton onClick={handleOpenEditModal} aria-label="edit">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={handleOpenDeleteModal} aria-label="delete">
                        <DeleteIcon />
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
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="delete-modal-title" variant="h6" component="h2">
                        {lang.DELETE_CONFIRMATION}
                    </Typography>
                    <Typography id="delete-modal-description" sx={{ mt: 2 }}>
                        {lang.DELETE_SUBSCRIPTION_CONFIRMATION} "{level.title}"?
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

            {/* Edit Modal */}
            <Modal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                aria-labelledby="edit-modal-title"
                aria-describedby="edit-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="edit-modal-title" variant="h6" component="h2">
                        {lang.EDIT_SUBSCRIPTION_LEVEL}
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="title"
                        label={lang.TITLE}
                        name="title"
                        value={editedLevel.title}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="description"
                        label={lang.DESCRIPTION}
                        name="description"
                        value={editedLevel.description}
                        onChange={handleInputChange}
                        multiline
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="price"
                        label={lang.PRICE}
                        name="price"
                        value={editedLevel.price}
                        onChange={handleInputChange}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around'}}>
                        <Button onClick={handleCloseEditModal} variant="contained" color="primary">
                            {lang.CANCEL}
                        </Button>
                        <Button onClick={handleUpdate} variant="contained" color="success">
                            {lang.SAVE}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default EditableSubscriptionLevelCard;
