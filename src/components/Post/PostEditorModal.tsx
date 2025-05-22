import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';
import PostEditor from './PostEditor';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface PostEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (post: Omit<Post, 'id' | 'createdAt'>) => void;
}

const PostEditorModal: React.FC<PostEditorModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    onSave({
      title,
      content,
    });
    setTitle('');
    setContent('');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Создать пост</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <PostEditor
            content={content}
            onChange={setContent}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!title.trim() || !content.trim()}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostEditorModal;
