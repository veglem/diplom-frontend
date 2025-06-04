import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Collapse,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import FavoriteIcon from "@mui/icons-material/Favorite"
import CommentIcon from "@mui/icons-material/Comment"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { CommentSection } from './CommentSection';
import { Post } from '../../types/user';
import { usePost } from '../../contexts/PostContext';
import PostEditorModal from './PostEditorModal';

// Компонент карточки поста с данными из props
export const PostCardContent: React.FC<{ post: Post }> = ({ post }) => {
    console.log(post)
    // Проверяем, есть ли у поста аттачи
    const hasAttachments = post.attachment_ids && post.attachment_ids.length > 0;
    
    // Состояние для отображения секции комментариев
    const [showComments, setShowComments] = useState(false);
    
    // Состояния для меню и модальных окон
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const {likePost, unlikePost, isLiked, comments, isCurrentUserAuthor, updatePost, deletePost} = usePost();
    const {lang} = useLanguage();
    
    // Обработчики для меню
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    // Обработчики для модальных окон
    const handleEditClick = () => {
        handleMenuClose();
        setEditModalOpen(true);
    };
    
    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteModalOpen(true);
    };
    
    const handleEditModalClose = () => {
        setEditModalOpen(false);
    };
    
    const handleDeleteModalClose = () => {
        setDeleteModalOpen(false);
    };
    
    // Обработчик для сохранения отредактированного поста
    const handleSavePost = (postData: { title: string, content: string, attachments: File[], subscriptionIds: string[] }) => {
        updatePost(postData.title, postData.content, postData.attachments, postData.subscriptionIds)
        // Здесь будет логика сохранения поста (реализуется пользователем)
        console.log('Сохранение поста:', postData);
        // Раскомментируйте следующую строку для активации функционала сохранения
        // updatePost(postData.title, postData.content);
    };
    
    // Обработчик для удаления поста
    const handleDeletePost = () => {
        // Здесь будет логика удаления поста (реализуется пользователем)
        console.log('Удаление поста:', post.id);
        // Раскомментируйте следующую строку для активации функционала удаления
        // deletePost();
        deletePost();
        handleDeleteModalClose();
    };
    
    // Обработчик клика по кнопке комментариев
    const handleCommentsClick = () => {
        setShowComments(!showComments);
    };
    
    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
                <Typography variant="h6">
                    {post.title}
                </Typography>
                {isCurrentUserAuthor && (
                    <div>
                        <IconButton onClick={handleMenuOpen} size="small">
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleEditClick}>{lang.POST_EDIT}</MenuItem>
                            <MenuItem onClick={handleDeleteClick}>{lang.POST_DELETE}</MenuItem>
                        </Menu>
                    </div>
                )}
            </Box>
            {post.is_avalible ? <div dangerouslySetInnerHTML={{ __html: post.content }} /> : <Paper> <Typography>{lang.POST_NOT_AVAILABLE}</Typography> </Paper>}
            
            {/* Модальное окно для редактирования поста */}
            <PostEditorModal
                open={editModalOpen}
                onClose={handleEditModalClose}
                onSave={handleSavePost}
                initialTitle={post.title}
                initialContent={post.content}
                initialSubscribes={post.subscriptions}
            />
            
            {/* Модальное окно для подтверждения удаления поста */}
            <Dialog
                open={deleteModalOpen}
                onClose={handleDeleteModalClose}
            >
                <DialogTitle>{lang.POST_DELETE_TITLE}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {lang.POST_DELETE_CONFIRMATION}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteModalClose}>{lang.CANCEL}</Button>
                    <Button onClick={handleDeletePost} color="error">
                        {lang.DELETE}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Отображаем аттачи, если они есть */}
            {hasAttachments && post.is_avalible && (
                <Box sx={{ mt: 2 }}>
                    <Accordion>
                        <AccordionSummary>{lang.POST_ATTACHMENTS}</AccordionSummary>
                        <AccordionDetails>
                            {post.attachment_ids?.map((attachmentId, index) => {
                            const attachmentType = post.attachment_types?.[index] || '';
                            const isImage = attachmentType.startsWith('image/');
                            const isVideo = attachmentType.startsWith('video/');
                            return (
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                        }}
                                    >
                                        {isImage ? (
                                            <img
                                                src={`/images/user/${attachmentId}.${attachmentType.replace('image/', '')}`}
                                                alt={`Attachment ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        ) : isVideo ? (
                                            <video
                                                src={`/images/user/${attachmentId}.${attachmentType.replace('video/', '')}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                                controls
                                            />
                                        ) : null}
                                    </Box>
                                
                            );
                        })}
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )}
            {post.is_avalible && <Box width='100%' display='flex' flexDirection='row-reverse' alignItems='center'>
                <IconButton onClick={isLiked ? unlikePost : likePost}>
                    {isLiked ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {post.likes_count}
                    </Typography>
                </IconButton>
                <IconButton onClick={handleCommentsClick}>
                    <CommentIcon />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {comments.length}
                    </Typography>
                </IconButton>
            </Box>}
            
            {/* Секция комментариев */}
            {post.is_avalible && <Collapse in={showComments} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2 }}>
                    <CommentSection />
                </Box>
            </Collapse>}
        </Paper>
    );
};

// Обертка для PostCard с использованием PostContext
export const PostCard: React.FC<{ postId: string }> = ({ postId }) => {
    return <PostCardWithContext postId={postId} />;
};

// Компонент PostCard с использованием PostContext
const PostCardWithContext: React.FC<{ postId: string }> = ({ postId }) => {
    const { post, attachmentIds, isLoading } = usePost();
    
    const {lang} = useLanguage();
    
    if (isLoading || !post) {
        return (
            <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Typography>{lang.POST_LOADING}</Typography>
            </Paper>
        );
    }

    console.log(attachmentIds)
    
    return <PostCardContent post={{
        ...post,
        attachment_ids: attachmentIds.map(val => {
            return val.id
        }),
        attachment_types: attachmentIds.map(val => {
            // Определяем тип аттача по расширению файла
            return val.type;
        })
    }} />;
};
