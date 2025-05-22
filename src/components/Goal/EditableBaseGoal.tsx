import React, { useState } from 'react';
import { Box, IconButton, Modal, TextField, Typography, Button } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete"
import { BaseGoal } from './BaseGoal';

interface Goal {
    current: number;
    target: number;
}

interface EditableGoalProps {
    goal: Goal;
    isMobile: boolean;
    onUpdate: (updatedGoal: Goal) => void;
    onDelete: () => void;
}

const EditableBaseGoal: React.FC<EditableGoalProps> = ({ goal, isMobile, onUpdate, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editedGoal, setEditedGoal] = useState(goal);

    const handleOpenEditModal = () => setEditModalOpen(true);
    const handleCloseEditModal = () => setEditModalOpen(false);
    const handleOpenDeleteModal = () => setDeleteModalOpen(true);
    const handleCloseDeleteModal = () => setDeleteModalOpen(false);

    const handleUpdate = () => {
        onUpdate(editedGoal);
        handleCloseEditModal();
    };

    const handleDelete = () => {
        onDelete();
        handleCloseDeleteModal();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedGoal(prev => ({ ...prev, [name]: Number(value) }));
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
                        Редактировать цель
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="current"
                        label="Текущее значение"
                        name="current"
                        value={editedGoal.current}
                        onChange={handleInputChange}
                        type="number"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="target"
                        label="Целевое значение"
                        name="target"
                        value={editedGoal.target}
                        onChange={handleInputChange}
                        type="number"
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                        <Button onClick={handleCloseEditModal} variant="contained" color="primary">
                            Отмена
                        </Button>
                        <Button onClick={handleUpdate} variant="contained" color="success">
                            Сохранить
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
                        Подтверждение удаления
                    </Typography>
                    <Typography id="delete-modal-description" sx={{ mt: 2 }}>
                        Вы уверены, что хотите удалить цель?
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                        <Button onClick={handleCloseDeleteModal} variant="contained" color="primary">
                            Отмена
                        </Button>
                        <Button onClick={handleDelete} variant="contained" color="error">
                            Удалить
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default EditableBaseGoal;
