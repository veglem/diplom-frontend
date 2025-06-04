import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Paper,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { usePost } from '../../contexts/PostContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

// Компонент для отображения одного комментария
const CommentItem: React.FC<{ 
  commentId: string;
  userId: string;
  displayName: string;
  profilePhoto?: string;
  text: string;
  creationDate: Date;
  likesCount: number;
  onRefresh: () => void;
}> = ({ 
  commentId, 
  userId, 
  displayName, 
  profilePhoto, 
  text, 
  creationDate, 
  likesCount,
  onRefresh
}) => {
  const { isCommentLiked, likeComment, unlikeComment, isCommentAuthor, deleteComment, editComment } = usePost();
  const { user } = useAuth();
  const { lang } = useLanguage();
  
  const [liked, setLiked] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedText, setEditedText] = useState(text);
  
  // Проверяем, поставил ли пользователь лайк комментарию
  useEffect(() => {
    const checkLiked = async () => {
      const isLiked = await isCommentLiked(commentId);
      setLiked(isLiked);
    };
    
    const checkIsAuthor = async () => {
      const author = await isCommentAuthor(commentId);
      setIsAuthor(author);
    };
    
    checkLiked();
    checkIsAuthor();
  }, [commentId, isCommentLiked, isCommentAuthor]);
  
  // Обработчик клика по кнопке лайка
  const handleLikeClick = async () => {
    if (liked) {
      await unlikeComment(commentId);
    } else {
      await likeComment(commentId);
    }
    setLiked(!liked);
    onRefresh();
  };
  
  // Обработчик открытия меню
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Обработчик закрытия меню
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Обработчик удаления комментария
  const handleDelete = async () => {
    await deleteComment(commentId);
    handleMenuClose();
    onRefresh();
  };
  
  // Обработчик открытия диалога редактирования
  const handleEditOpen = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };
  
  // Обработчик закрытия диалога редактирования
  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditedText(text);
  };
  
  // Обработчик сохранения изменений
  const handleSave = async () => {
    await editComment(commentId, editedText);
    setEditDialogOpen(false);
    onRefresh();
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <Avatar src={`/images/user/${profilePhoto}.jpg`} alt={displayName} sx={{ mr: 1, width: 32, height: 32 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">{displayName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                {/* {formatDistanceToNow(new Date(creationDate), { addSuffix: true, locale: ru })} */}
              </Typography>
              {isAuthor && (
                <>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleEditOpen}>{lang.COMMENT_EDIT}</MenuItem>
                    <MenuItem onClick={handleDelete}>{lang.COMMENT_DELETE}</MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>
          <Typography variant="body2" textAlign='start'>{text}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <IconButton size="small" onClick={handleLikeClick} disabled={!user}>
              {liked ? <FavoriteIcon fontSize="small" color="error" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {likesCount}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Диалог редактирования комментария */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>{lang.COMMENT_EDIT_TITLE}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={3}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>{lang.CANCEL}</Button>
          <Button onClick={handleSave} disabled={!editedText.trim()}>{lang.SAVE}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Компонент формы для добавления комментария
const CommentForm: React.FC<{ onCommentAdded: () => void }> = ({ onCommentAdded }) => {
  const { addComment } = usePost();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      await addComment(commentText);
      setCommentText('');
      onCommentAdded();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={2}
        placeholder={user ? lang.COMMENT_PLACEHOLDER : lang.COMMENT_LOGIN_REQUIRED}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        disabled={!user || isSubmitting}
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!user || !commentText.trim() || isSubmitting}
        >
          {lang.COMMENT_SEND}
        </Button>
      </Box>
    </Box>
  );
};

// Основной компонент секции комментариев
export const CommentSection: React.FC = () => {
  const { comments, refreshComments } = usePost();
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();
  
  // Обновление комментариев
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshComments();
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    handleRefresh();
  }, []);
  
  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {lang.COMMENTS} ({comments.length})
      </Typography>
      
      <CommentForm onCommentAdded={handleRefresh} />
      
      <Divider sx={{ mb: 2 }} />
      
      {isLoading ? (
        <Typography align="center">{lang.COMMENTS_LOADING}</Typography>
      ) : comments.length === 0 ? (
        <Typography align="center" color="text.secondary">
          {lang.COMMENTS_EMPTY}
        </Typography>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment.comment_id}
            commentId={comment.comment_id}
            userId={comment.user_id}
            displayName={comment.display_name}
            profilePhoto={comment.profile_photo}
            text={comment.comment_text}
            creationDate={new Date(comment.creation_date)}
            likesCount={comment.likes_count}
            onRefresh={handleRefresh}
          />
        ))
      )}
    </Paper>
  );
};
