import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

interface CreateGoalButtonProps {
    onCreate: (aim: string, targetValue: number) => Promise<void>
}

export const CreateGoalButton: React.FC<CreateGoalButtonProps> = ({ onCreate }) => {
    const { lang } = useLanguage();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [creatingGoal, setCreatingGoal] = useState({aim: '', moneyGot: 0, moneyNeeded: 0});

    const handleChageInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCreatingGoal({ ...creatingGoal, moneyNeeded: Number(e.target.value)});
    }

    const handleChageAimInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCreatingGoal({ ...creatingGoal, aim: e.target.value});
    }

    const handleCloseCreteModal = () => {
        setCreateModalOpen(false);
    }

    const handleUpdate = () => {
        onCreate(creatingGoal.aim, creatingGoal.moneyNeeded);
        setCreateModalOpen(false)
    };

    return <>
        <Button onClick={() => { setCreateModalOpen(true) }}>
            {lang.CREATE_GOAL}
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
                    {lang.CREATE_GOAL}
                </Typography>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="aim"
                    label={lang.GOAL}
                    name="aim"
                    value={creatingGoal.aim}
                    onChange={handleChageAimInput}
                    type='text'
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="moneyNeeded"
                    label={lang.TARGET_VALUE}
                    name="moneyNeeded"
                    value={creatingGoal.moneyNeeded}
                    onChange={handleChageInput}
                    type="number"
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                    <Button onClick={handleCloseCreteModal} variant="contained" color="primary">
                        {lang.CANCEL}
                    </Button>
                    <Button onClick={handleUpdate} variant="contained" color="success">
                        {lang.SAVE}
                    </Button>
                </Box>
            </Box>
        </Modal>
    </>
}
