import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Button,
    Paper,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { useDevice } from '../utils/DeviceContext';
import PostEditorModal from '../components/Post/PostEditorModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Writer, Post } from '../types/user';
import { useWriter, WriterProvider } from '../contexts/WriterContext';
import { PostProvider, usePost } from '../contexts/PostContext';
import { writerService } from '../services/writerService';
import EditableSubscriptionLevelCard from '../components/SubscriptionCard/EditableSubscriptionLevelCard';
import { HeadImage } from '../components/HeadImage/HeadImage';
import { BaseGoal } from '../components/Goal/BaseGoal';
import EditableBaseGoal from '../components/Goal/EditableBaseGoal';
import {EditableHeadImage} from '../components/HeadImage/EditableHeadImage';

// Компонент карточки поста с данными из props
const PostCardContent: React.FC<{ post: Post }> = ({ post }) => {
    // Проверяем, есть ли у поста аттачи
    const hasAttachments = post.attachment_ids && post.attachment_ids.length > 0;
    
    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                {post.title}
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            
            {/* Отображаем аттачи, если они есть */}
            {hasAttachments && (
                <Box sx={{ mt: 2 }}>
                    <Accordion>
                        <AccordionSummary>Прикрепленные файлы</AccordionSummary>
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
                                                src={attachmentId}
                                                alt={`Attachment ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        ) : isVideo ? (
                                            <video
                                                src={attachmentId}
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
        </Paper>
    );
};

// Обертка для PostCard с использованием PostContext
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    return <PostCardWithContext postId={post.id} />;
};

// Компонент PostCard с использованием PostContext
const PostCardWithContext: React.FC<{ postId: string }> = ({ postId }) => {
    const { post, attachmentIds, isLoading } = usePost();
    
    if (isLoading || !post) {
        return (
            <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Typography>Загрузка...</Typography>
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

// Компонент профиля для десктопа
const DesktopWriterProfile: React.FC<{
    writer: Writer | undefined;
    posts: Post[];
    onCreatePostClick: () => void;
}> = ({ writer, posts, onCreatePostClick }) => {
    console.log(writer)
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <EditableHeadImage isMobile={false} onUpdate={()=> {}} onDelete={()=> {}} src='https://asset.gecdesigns.com/img/background-templates/gradient-triangle-abstract-background-template-10032405-1710079376651-cover.webp'></EditableHeadImage>
            <Box sx={{ display: 'flex', gap: 4, width: '100%' }}>
                {/* Левая боковая панель */}
                <Box sx={{ width: 300, flexShrink: 0 }}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
                        {writer ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        mb: 2
                                    }}
                                    src={writer.avatar}
                                >
                                    {writer.avatar ? "" : "Аватар"}
                                </Avatar>
                                <Typography variant="h5" gutterBottom>
                                    {writer.username}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {writer.subscriptions} подписчиков
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="body1" paragraph>
                                Ошибка загрузки данных профиля.
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body1" paragraph>
                            {writer?.bio}
                        </Typography>

                        {writer?.goal && <EditableBaseGoal goal={writer.goal} isMobile={false} onUpdate={() => {}} onDelete={() => {}}/>}

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={onCreatePostClick}
                        >
                            Создать пост
                        </Button>
                    </Paper>
                </Box>

                {/* Основная область */}
                <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
                    <Box sx={{ mb: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                overflowX: 'auto',
                                pb: 2,
                                '&::-webkit-scrollbar': {
                                    height: 8,
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    borderRadius: 4,
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    borderRadius: 4,
                                },
                            }}
                        >
                            <EditableSubscriptionLevelCard level={{
                                id: 'string',
                                title: 'string',
                                price: '34',
                                description: 'string'
                            }} isMobile={false} onDelete={() => { console.log("deleted") }} onUpdate={() => { console.log("udatte") }}></EditableSubscriptionLevelCard>
                        </Box>
                    </Box>

                    {posts.length > 0 ? (
                        posts.map(post => (
                            <PostProvider key={post.id} postId={post.id}>
                                <PostCard key={post.id} post={post} />
                            </PostProvider>
                        ))
                    ) : (
                        <Paper elevation={0} variant="outlined" sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                Нет постов
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

// Компонент профиля для мобильных устройств
const MobileWriterProfile: React.FC<{
    writer: Writer | undefined;
    posts: Post[];
    onCreatePostClick: () => void;
}> = ({ writer, posts, onCreatePostClick }) => {
    return (
        <Box sx={{ width: '100%' }}>
            <HeadImage src='https://asset.gecdesigns.com/img/background-templates/gradient-triangle-abstract-background-template-10032405-1710079376651-cover.webp'></HeadImage>
            {/* Шапка профиля */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2 }}>
                <Avatar
                    sx={{
                        width: 60,
                        height: 60,
                        mr: 2
                    }}
                    src={writer?.avatar}
                >
                    {writer?.avatar ? "" : "Аватар"}
                </Avatar>
                <Box>
                    <Typography variant="h6">
                        {writer?.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {writer?.subscriptions} подписчиков
                    </Typography>
                </Box>
            </Box>

            {/* Описание канала */}
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="body1">
                    {writer?.bio}
                </Typography>
            </Paper>

            {/* Уровни подписки */}
            <Typography variant="h6" sx={{ mb: 2, px: 2 }}>
                Уровни подписки
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    pb: 2,
                    px: 1,
                    '&::-webkit-scrollbar': {
                        height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: 4,
                    },
                }}
            >
                <EditableSubscriptionLevelCard level={{
                    id: 'string',
                    title: 'string',
                    price: '34',
                    description: 'string'
                }} isMobile={true} onDelete={() => { console.log("deleted") }} onUpdate={() => { console.log("udatte") }}></EditableSubscriptionLevelCard>
                <EditableSubscriptionLevelCard level={{
                    id: 'string',
                    title: 'string',
                    price: '34',
                    description: 'string'
                }} isMobile={true} onDelete={() => { console.log("deleted") }} onUpdate={() => { console.log("udatte") }}></EditableSubscriptionLevelCard>
                <EditableSubscriptionLevelCard level={{
                    id: 'string',
                    title: 'string',
                    price: '34',
                    description: 'string'
                }} isMobile={true} onDelete={() => { console.log("deleted") }} onUpdate={() => { console.log("udatte") }}></EditableSubscriptionLevelCard>
                <EditableSubscriptionLevelCard level={{
                    id: 'string',
                    title: 'string',
                    price: '34',
                    description: 'string'
                }} isMobile={true} onDelete={() => { console.log("deleted") }} onUpdate={() => { console.log("udatte") }}></EditableSubscriptionLevelCard>
                <EditableSubscriptionLevelCard level={{
                    id: 'string',
                    title: 'string',
                    price: '34',
                    description: 'string'
                }} isMobile={true} onDelete={() => { console.log("deleted") }} onUpdate={() => { console.log("udatte") }}></EditableSubscriptionLevelCard>
            </Box>

            {/* Цель */}
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, mt: 2 }}>
                {writer?.goal && <BaseGoal goal={writer.goal} isMobile={true} />}
            </Paper>

            {/* Кнопка создания поста */}
            <Box sx={{ px: 2, mb: 4 }}>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={onCreatePostClick}
                >
                    Создать пост
                </Button>
            </Box>

            {/* Посты */}
            <Box sx={{ px: 2 }}>
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostProvider postId={post.id}>
                            <PostCard key={post.id} post={post} />
                        </PostProvider>
                    ))
                ) : (
                    <Paper elevation={0} variant="outlined" sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            Нет постов
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

// Компонент профиля писателя с использованием WriterContext
const WriterProfileWithContext: React.FC = () => {
    const { isMobile } = useDevice();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    
    const { 
        writer, 
        postIds, 
        isLoading, 
        createPost,
        refreshPosts
    } = useWriter();
    
    const handleCreatePost = (newPost: { title: string, content: string, attachments: File[] }) => {
        createPost(newPost.title, newPost.content, newPost.attachments)
            .then(() => {
                refreshPosts();
            })
            .catch(error => {
                console.error("Error creating post:", error);
            });
    };
    
    if (isLoading) {
        return (
            <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                <Typography>Загрузка профиля...</Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ py: 2 }}>
            {isMobile ? (
                <MobileWriterProfile
                    writer={writer || undefined}
                    posts={postIds.map(id => ({ id, title: '', content: '', authorId: writer?.id || '' }))}
                    onCreatePostClick={() => setIsEditorOpen(true)}
                />
            ) : (
                <DesktopWriterProfile
                    writer={writer || undefined}
                    posts={postIds.map(id => ({ id, title: '', content: '', authorId: writer?.id || '' }))}
                    onCreatePostClick={() => setIsEditorOpen(true)}
                />
            )}
            <PostEditorModal
                open={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleCreatePost}
            />
        </Box>
    );
};

/**
 * Страница профиля писателя
 * Адаптируется под тип устройства
 */
const WriterProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [writerId, setWriterId] = useState<string | null>(null);
    
    useEffect(() => {
        if (user?.isAuthor !== true) {
            navigate('/settings/profile');
            return;
        }
        
        if (user?.id) {
            // Используем ID пользователя как ID писателя
            writerService.getSelfWriterId(user.id).then(data => {
                if (data) {
                    setWriterId(data);
                }
            });
        }
    }, [user, navigate]);
    
    if (!writerId) {
        return (
            <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                <Typography>Загрузка...</Typography>
            </Box>
        );
    }
    
    return (
        <WriterProvider writerId={writerId}>
            <WriterProfileWithContext />
        </WriterProvider>
    );
};

export default WriterProfilePage;
