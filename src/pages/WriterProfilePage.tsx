import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Button,
    Card,
    CardContent,
    LinearProgress,
    Grid,
    Container,
    useTheme,
    Paper,
    Stack,
    Divider,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import { useDevice } from '../utils/DeviceContext';
import PostEditorModal from '../components/Post/PostEditorModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { writerService } from '../services/writerService';
import { Writer, Post } from '../types/user';
import EditableSubscriptionLevelCard from '../components/SubscriptionCard/EditableSubscriptionLevelCard';
import { HeadImage } from '../components/HeadImage/HeadImage';
import { BaseGoal } from '../components/Goal/BaseGoal';
import EditableBaseGoal from '../components/Goal/EditableBaseGoal';
import {EditableHeadImage} from '../components/HeadImage/EditableHeadImage';

// Компонент карточки поста
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                {post.title}
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </Paper>
    );
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
                            <PostCard key={post.id} post={post} />
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
                        <PostCard key={post.id} post={post} />
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

/**
 * Страница профиля писателя
 * Адаптируется под тип устройства
 */
const WriterProfilePage: React.FC = () => {
    const { isMobile } = useDevice();
    const theme = useTheme();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [writer, setWriter] = useState<Writer | undefined>(undefined);

    const { user } = useAuth();
    const navigate = useNavigate();
    const [writerId, setWriterId] = useState("")



    useEffect(() => {
        if (user?.isAuthor != true) {
            navigate('/settings/profile');
        }

        if (!writerId && user?.id) {
            console.log("getting id")
            writerService.getSelfWriterId(user?.id).then(data => {
                console.log(data)
                if (data) {
                    setWriterId(data)
                }
            })
        }
        if (writerId) {
            console.log("getting profile")
            writerService.getWriterProfile(writerId)
                .then(data => {
                    setWriter(data);
                })
                .catch(error => {
                    console.error("Error fetching writer profile:", error);
                });

            writerService.getWriterPosts(writerId)
                .then(data => {
                    setPosts(data);
                })
                .catch(error => {
                    console.error("Error fetching writer posts:", error);
                });
        }

    }, [user, navigate, writerId]);

    const handleCreatePost = (newPost: Omit<Post, 'id' | 'authorId'>) => {
        if (writerId) {
            const post: Post = {
                ...newPost,
                id: Date.now().toString(),
                authorId: writerId,
            };
            setPosts([post, ...posts]);
        }
    };

    return (
        <Box sx={{ py: 2 }}>
            {isMobile ? (
                <MobileWriterProfile
                    writer={writer}
                    posts={posts}
                    onCreatePostClick={() => setIsEditorOpen(true)}
                />
            ) : (
                <DesktopWriterProfile
                    writer={writer}
                    posts={posts}
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

export default WriterProfilePage;
