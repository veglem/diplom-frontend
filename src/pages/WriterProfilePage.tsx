import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Button,
    Paper,
    Divider,
    CircularProgress,
    TextField,
    IconButton,
    Fade,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { useDevice } from '../utils/DeviceContext';
import PostEditorModal from '../components/Post/PostEditorModal';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Writer, Post } from '../types/user';
import { useWriter, WriterProvider } from '../contexts/WriterContext';
import { PostProvider } from '../contexts/PostContext';
import { writerService } from '../services/writerService';
import { useLanguage } from '../contexts/LanguageContext';
import EditableSubscriptionLevelCard from '../components/SubscriptionCard/EditableSubscriptionLevelCard';
import NonEditableSubscriptionLevelCard from '../components/SubscriptionCard/NonEditableSubscriptionLevelCard';
import CreateSubscriptionLevelButton from '../components/SubscriptionCard/CreateSubscriptionLevelButton';
import { HeadImage } from '../components/HeadImage/HeadImage';
import { BaseGoal } from '../components/Goal/BaseGoal';
import EditableBaseGoal from '../components/Goal/EditableBaseGoal';
import { EditableHeadImage } from '../components/HeadImage/EditableHeadImage';
import { PostCard } from '../components/Post/PostCard';
import { useParams } from 'react-router';
import { useNotification } from '../contexts/NotificationContext';
import { CreateHeadImageButton } from '../components/HeadImage/CreateHeadImageButton';
import { EditableAvatar } from '../components/Avatar/EditableAvatar';
import { BaseAvatar } from '../components/Avatar/BaseAvatar';
import { CreateGoalButton } from '../components/Goal/CreateGoalButton';

// Интерфейс для Goal, используемый в компонентах
interface Goal {
    aim: string;
    moneyGot: number;
    moneyNeeded: number;
}

const WriterProfilePage: React.FC = () => {
    const params = useParams();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const { lang } = useLanguage();

    const writerId = params.author_id
    if (writerId == undefined) {
        showNotification(lang.AUTHOR_PAGE_ERROR, 'error');
        navigate('/')
    }

    return <WriterProvider writerId={writerId as string}>
        <ContextedWriterProfilePage></ContextedWriterProfilePage>
    </WriterProvider>
}

const ContextedWriterProfilePage: React.FC = () => {
    const { showNotification } = useNotification();
    const { } = useAuth();
    const { lang } = useLanguage();
    const { 
        followersCount,
        isLoading, 
        isCurrentUserWriter, 
        writer, 
        updateWriterCover, 
        updateWriterAvatar, 
        isFollowing, 
        followWriter, 
        unfollowWriter, 
        updateWriterGoal, 
        createPost, 
        postIds,
        subscriptionLevels,
        createSubscriptionLevel,
        updateSubscriptionLevel,
        deleteSubscriptionLevel,
        updateWriterProfile,
        translating,
        setTranslating
    } = useWriter();
    const { isMobile } = useDevice()

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [nameValue, setNameValue] = useState('');
    const [bioValue, setBioValue] = useState('');

    const handleCreatePost = (newPost: { title: string, content: string, attachments: File[], subscriptionIds: string[] }) => {
        createPost(newPost.title, newPost.content, newPost.attachments, newPost.subscriptionIds)
    }

    // Обработчики для редактирования имени
    const handleNameEditStart = () => {
        if (isCurrentUserWriter && writer) {
            setNameValue(writer.username);
            setIsEditingName(true);
        }
    };

    const handleNameSave = async () => {
        if (nameValue.trim() !== '') {
            await updateWriterProfile({ name: nameValue });
            setIsEditingName(false);
        } else {
            showNotification(lang.NAME_EMPTY_ERROR, 'error');
        }
    };

    // Обработчики для редактирования описания
    const handleBioEditStart = () => {
        if (isCurrentUserWriter && writer) {
            setBioValue(writer.bio || '');
            setIsEditingBio(true);
        }
    };

    const handleBioSave = async () => {
        await updateWriterProfile({ description: bioValue });
        setIsEditingBio(false);
    };

    if (isLoading) {
        return <Box display='flex' alignItems='center' justifyContent={'center'}>
            <CircularProgress></CircularProgress>
        </Box>
    }

    let coverPhotoComponent = <></>;
    if (writer?.coverPhoto != undefined && writer?.coverPhoto != '00000000-0000-0000-0000-000000000000') {
        if (isCurrentUserWriter) {
            coverPhotoComponent = <EditableHeadImage src={writer.coverPhoto} isMobile={isMobile} onUpdate={updateWriterCover} onDelete={() => { }} />
        } else {
            coverPhotoComponent = <HeadImage src={writer.coverPhoto} />
        }
    } else if (isCurrentUserWriter) {
        coverPhotoComponent = <CreateHeadImageButton onUploadCover={updateWriterCover} />
    }

    let goalComponent = <></>
    if (writer?.goal.aim != undefined || writer?.goal.aim == '') {
        if (isCurrentUserWriter) {
            goalComponent = <EditableBaseGoal
                goal={{ aim: writer.goal.aim ?? '', moneyGot: writer.goal.current, moneyNeeded: writer.goal.target }}
                isMobile={isMobile}
                onUpdate={updateWriterGoal}
                onDelete={() => { updateWriterGoal('', 0) }} />
        } else {
            goalComponent = <BaseGoal goal={{ aim: writer.goal.aim ?? '', moneyGot: writer.goal.current, moneyNeeded: writer.goal.target }} isMobile={isMobile} />
        }
    } else if (isCurrentUserWriter) {
        goalComponent = <CreateGoalButton onCreate={updateWriterGoal} />
    }

    const createPostButtonComponent = <>
        <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setIsEditorOpen(true)}
        >
            {lang.CREATE_POST}
        </Button>
        <PostEditorModal
            open={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleCreatePost}
        />
    </>

    console.log(isMobile && isCurrentUserWriter)


    return <Box sx={{ py: 2 }}>
        {coverPhotoComponent}
        <Box display='flex' flexDirection={isMobile ? 'column' : 'row'}>
            <Box>
                <Paper variant='outlined' sx={{ padding: 3, width: isMobile ? 'auto' : '300px' }}>
                <Box display='flex' flexDirection={isMobile ? 'row' : 'column'} alignItems='center'>
                    <Box sx={{ position: 'relative', margin: 1 }}>
                        {isCurrentUserWriter ?
                            <EditableAvatar username={writer?.username ?? ''} size={isMobile ? 'small' : 'small-L'} src={writer?.profilePhoto ?? ''} onAvatarUpload={updateWriterAvatar} /> :
                            <BaseAvatar username={writer?.username ?? ''} size={isMobile ? 'small' : 'small-L'} src={writer?.profilePhoto ?? ''} />
                        }
                    </Box>
                    <Box display='flex' flexDirection='column' sx={{ margin: 1 }} >
                        {isCurrentUserWriter && isEditingName ? (
                            <Box display="flex" alignItems="center">
                                <TextField
                                    variant="standard"
                                    value={nameValue}
                                    onChange={(e) => setNameValue(e.target.value)}
                                    fullWidth
                                    autoFocus
                                    sx={{ mr: 1 }}
                                />
                                <IconButton onClick={handleNameSave} size="small" color="primary">
                                    <SaveIcon />
                                </IconButton>
                            </Box>
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent='center'>
                                <Typography 
                                    variant={isMobile ? 'h6' : 'h5'} 
                                    onClick={isCurrentUserWriter ? handleNameEditStart : undefined}
                                    sx={isCurrentUserWriter ? { 
                                        cursor: 'pointer',
                                        '&:hover': { 
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                            borderRadius: '4px'
                                        }
                                    } : {}}
                                >
                                    {writer?.username}
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="body2" color="text.secondary">
                        
                        </Typography>
                    </Box>
                    <Button sx={{ margin: 1 }} disabled={isCurrentUserWriter} color={isFollowing ? 'error' : 'success'} onClick={isFollowing ? unfollowWriter : followWriter}>{isFollowing ? lang.UNSUBSCRIBE : lang.SUBSCRIBE}</Button>
                </Box>
                <Divider></Divider>
                {isCurrentUserWriter && isEditingBio ? (
                    <Box sx={{ margin: 1, display: 'flex', alignItems: 'flex-start' }}>
                        <TextField
                            variant="outlined"
                            value={bioValue}
                            onChange={(e) => setBioValue(e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            autoFocus
                            sx={{ mr: 1 }}
                        />
                        <IconButton onClick={handleBioSave} color="primary" sx={{ mt: 1 }}>
                            <SaveIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <Box 
                        sx={{ 
                            margin: 1,
                            ...(isCurrentUserWriter ? {
                                cursor: 'pointer',
                                '&:hover': { 
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    borderRadius: '4px'
                                }
                            } : {})
                        }}
                        onClick={isCurrentUserWriter ? handleBioEditStart : undefined}
                    >
                        <Typography>
                            {writer?.bio || lang.ADD_DESCRIPTION}
                        </Typography>
                    </Box>
                )}
                <Divider></Divider>
                {isMobile ? <></> : goalComponent}
                {!isMobile && isCurrentUserWriter && createPostButtonComponent}
            </Paper>
            </Box>
            
            <Box display='flex' flexDirection='column' sx={{overflowX: 'hidden', flexGrow: 1, paddingLeft: isMobile ? 0 : 2 }}>
                <Box>
                    <Paper variant='outlined' sx={{p:1}}>
                        <Typography variant="h6" sx={{ ml: 2, mb: 1 }}>
                        {lang.SUBSCRIPTION_LEVELS}
                    </Typography>
                    </Paper>
                    
                    <Box sx={{
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
                    }}>
                        {subscriptionLevels.map(level => (
                            isCurrentUserWriter && level.is_avalible ? (
                                <EditableSubscriptionLevelCard
                                    key={level.id}
                                    level={level}
                                    isMobile={isMobile}
                                    onDelete={deleteSubscriptionLevel}
                                    onUpdate={(id, updatedLevel) => 
                                        updateSubscriptionLevel(
                                            id, 
                                            updatedLevel.title, 
                                            parseFloat(updatedLevel.price), 
                                            updatedLevel.description
                                        )
                                    }
                                />
                            ) : (
                                <NonEditableSubscriptionLevelCard
                                    key={level.id}
                                    level={level}
                                    isMobile={isMobile}
                                />
                            )
                        ))}
                        
                        {isCurrentUserWriter && (
                            <CreateSubscriptionLevelButton isMobile={isMobile} />
                        )}
                    </Box>
                </Box>

                {!isMobile ? <></> : <Paper>{goalComponent}</Paper> }
                {isMobile && isCurrentUserWriter && createPostButtonComponent}
                {postIds.length > 0 ? (
                        postIds.map(postId => (
                            <PostProvider key={postId} postId={postId}>
                                <PostCard key={postId} postId={postId} />
                            </PostProvider>
                        ))
                    ) : (
                        <Paper elevation={0} variant="outlined" sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                {lang.NO_POSTS}
                            </Typography>
                        </Paper>
                    )}
            </Box>
        </Box>
        {!isCurrentUserWriter && <Box sx={{position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 1500}}>
                  <Fade appear={false} in={translating == undefined}>
                  <Paper variant='outlined'>
                    <Typography>{lang.TRANSLATING}</Typography>
                    <Button color='primary' onClick={() => {setTranslating(true)}}>Да</Button>
                    <Button color='secondary' onClick={() => {setTranslating(false)}}>Нет</Button>
                  </Paper>
                </Fade>
                </Box>}
    </Box>
}

export default WriterProfilePage;
