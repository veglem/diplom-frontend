import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  SelectChangeEvent,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText
} from '@mui/material';
import PostEditor from './PostEditor';
import { useWriter } from '../../contexts/WriterContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface PostEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (post: { title: string, content: string, attachments: File[], subscriptionIds: string[] }) => void;
  initialTitle?: string;
  initialContent?: string;
  initialSubscribes?: string[];
}

const PostEditorModal: React.FC<PostEditorModalProps> = ({
  open,
  onClose,
  onSave,
  initialTitle = '',
  initialContent = '',
  initialSubscribes = []
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [subscriptionIds, setSubscriptionsIds] = useState<string[]>(initialSubscribes);

  const {subscriptionLevels} = useWriter();
  const {lang} = useLanguage();

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    // Если value - это строка (при использовании нативного select), то split(',')
    // Но с MUI Select multiple обычно приходит массив напрямую
    setSubscriptionsIds(typeof value === 'string' ? value.split(',') : value);
  };

  // Фильтруем только доступные уровни подписки
  const availableLevels = subscriptionLevels.filter(level => level.is_avalible);

  // Устанавливаем начальные значения при открытии модального окна
  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setContent(initialContent);
    } else {
      setTitle('');
      setContent('');
      setAttachments([]);
    }
  }, [open, initialTitle, initialContent]);

  const handleSave = () => {
    onSave({
      title,
      content,
      attachments,
      subscriptionIds
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{initialTitle ? lang.POST_EDIT : lang.POST_CREATE}</DialogTitle>
      <DialogContent>
        <Box>
          <InputLabel id="subscription-multi-select-label">{lang.POST_SELECT_SUBSCRIPTIONS}</InputLabel>
          <Select
            labelId="subscription-multi-select-label"
            id="subscription-multi-select"
            multiple
            value={subscriptionIds}
            onChange={handleChange}
            input={<OutlinedInput label={lang.POST_SELECT_SUBSCRIPTIONS} />}
            renderValue={(selected) => {
              // Отображаем выбранные названия через запятую
              return selected
                .map(id => {
                  const level = availableLevels.find(l => l.id === id);
                  return level ? level.title : '';
                })
                .filter(Boolean)
                .join(', ');
            }}
          >
            {availableLevels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                <Checkbox checked={subscriptionIds.indexOf(level.id) > -1} />
                <ListItemText primary={`${level.title} (${level.price})`} secondary={level.description} />
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label={lang.POST_TITLE}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <PostEditor
            content={content}
            onChange={setContent}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{lang.CANCEL}</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!title.trim() || !content.trim()}
        >
          {lang.SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostEditorModal;
