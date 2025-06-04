import React, { useState } from 'react';
import { Box, IconButton, Modal, TextField, Typography, Button } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete"
import { BaseGoal } from './BaseGoal';
import { useLanguage } from '../../contexts/LanguageContext';

interface Goal {
    aim: string;
    moneyGot: number;
    moneyNeeded: number;
}

interface EditableGoalProps {
    goal: Goal;
    isMobile: boolean;
    onUpdate: (aim: string, moneyNeeded: number) => void;
    onDelete: () => void;
}

const EditableBaseGoal: React.FC<EditableGoalProps> = ({ goal, isMobile, onUpdate, onDelete }) => {
    const { lang } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editedGoal, setEditedGoal] = useState(goal);

    const handleOpenEditModal = () => setEditModalOpen(true);
    const handleCloseEditModal = () => setEditModalOpen(false);
    const handleOpenDeleteModal = () => setDeleteModalOpen(true);
    const handleCloseDeleteModal = () => setDeleteModalOpen(false);

    const handleUpdate = () => {
        onUpdate(editedGoal.aim, editedGoal.moneyNeeded);
        handleCloseEditModal();
    };

    const handleDelete = () => {
        onDelete();
        handleCloseDeleteModal();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setEditedGoal(prev => ({ ...prev, moneyNeeded: Number(value) }));
    };

    const handleInputAimChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setEditedGoal(prev => ({ ...prev, aim: value }));
    };

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{ position: 'relative', alignItems: 'center' }}
        >
            <BaseGoal goal={editedGoal} isMobile={isMobile} />
            {(isHovered || isMobile) && (
                <Box sx={{ position: 'absolute', top: -15, right: -15, display: 'flex', flexDirection: 'row' }}>
                    <IconButton onClick={handleOpenEditModal} aria-label="edit">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={handleOpenDeleteModal} aria-label="delete">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )}

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
                        {lang.EDIT_GOAL}
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="aim"
                        label={lang.GOAL}
                        name="aim"
                        value={editedGoal.aim}
                        onChange={handleInputAimChange}
                        type='text'
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="moneyNeeded"
                        label={lang.TARGET_VALUE}
                        name="moneyNeeded"
                        value={editedGoal.moneyNeeded}
                        onChange={handleInputChange}
                        type="number"
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                        <Button onClick={handleCloseEditModal} variant="contained" color="primary">
                            {lang.CANCEL}
                        </Button>
                        <Button onClick={handleUpdate} variant="contained" color="success">
                            {lang.SAVE}
                        </Button>
                    </Box>
                </Box>
            </Modal>

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
                        {lang.DELETE_GOAL_CONFIRMATION}
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
        </Box>
    );
};

export default EditableBaseGoal;
