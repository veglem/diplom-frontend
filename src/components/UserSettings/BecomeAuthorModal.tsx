import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

interface BecomeAuthorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}

const BecomeAuthorModal: React.FC<BecomeAuthorModalProps> = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { lang } = useLanguage();

  const handleSubmit = () => {
    onSubmit(name, description);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{lang.BECOME_AUTHOR}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label={lang.AUTHOR_PAGE_NAME}
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          id="description"
          label={lang.AUTHOR_PAGE_DESCRIPTION}
          type="text"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{lang.CANCEL}</Button>
        <Button onClick={handleSubmit} color="primary">{lang.BECOME_AUTHOR}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BecomeAuthorModal;
