import React, { useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useWriter } from '../../contexts/WriterContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface CreateSubscriptionLevelButtonProps {
  isMobile: boolean;
}

const CreateSubscriptionLevelButton: React.FC<CreateSubscriptionLevelButtonProps> = ({ isMobile }) => {
  const { createSubscriptionLevel } = useWriter();
  const { lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price.trim() || !description.trim()) return;

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) return;

    setIsSubmitting(true);
    try {
      await createSubscriptionLevel(title, priceNumber, description);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          minWidth: isMobile ? 200 : 250,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 1,
          border: '1px dashed #ccc',
          borderRadius: 1,
          padding: 2,
          cursor: 'pointer'
        }}
        onClick={handleOpenModal}
      >
        <AddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          {lang.ADD_SUBSCRIPTION_LEVEL}
        </Typography>
      </Box>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="create-subscription-modal-title"
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
          <Typography id="create-subscription-modal-title" variant="h6" component="h2" gutterBottom>
            {lang.CREATE_NEW_SUBSCRIPTION_LEVEL}
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label={lang.TITLE}
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="price"
            label={lang.PRICE}
            name="price"
            type="number"
            inputProps={{ min: 0, step: 50 }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label={lang.DESCRIPTION}
            name="description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
            <Button onClick={handleCloseModal} variant="contained" color="primary">
              {lang.CANCEL}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="success"
              disabled={!title.trim() || !price.trim() || !description.trim() || isSubmitting}
            >
              {lang.CREATE}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default CreateSubscriptionLevelButton;
