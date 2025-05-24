import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

interface CreateGoalButtonProps {
    onCreate: (targetValue: number) => Promise<void>
}

const CreateGoalButton: React.FC = () => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [creatingGoal, setCreatingGoal] = useState("1");

    const handleChageInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCreatingGoal(e.target.value);
    }

    const handleCloseCreteModal = () => {
        setCreateModalOpen(false);
    }

    return <>
        <Button onClick={() => {setCreateModalOpen(true)}}>
            Создать цель
        </Button>
        <Modal
                open={createModalOpen}
                onClose={handleCloseCreteModal}
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
                        id="target"
                        label="Целевое значение"
                        name="target"
                        value={creatingGoal}
                        onChange={handleChageInput}
                        type="number"
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                        <Button onClick={handleCloseCreteModal} variant="contained" color="primary">
                            Отмена
                        </Button>
                        <Button onClick={handleUpdate} variant="contained" color="success">
                            Сохранить
                        </Button>
                    </Box>
                </Box>
            </Modal>
    </>
}