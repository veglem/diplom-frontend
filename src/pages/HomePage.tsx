import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Paper, 
  Box, 
  Button,
  Chip,
  Container,
  Grid,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Avatar,
  Unstable_TrapFocus,
  Fade,
} from '@mui/material';
import { useDevice } from '../utils/DeviceContext';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/Auth/LoginModal';
import RegisterModal from '../components/Auth/RegisterModal';
import { Link } from 'react-router';
import { api } from '../utils/api';
import { translationService } from '../utils/translate';
import { useLanguage } from '../contexts/LanguageContext';
import { htmlTranslator } from '../utils/htmlTranslator';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [posts, setPosts] = useState<{
    id: string;
    creator: string;
    creator_photo?: string;
    creator_name?: string;
    creation_date: string;
    likes_count: number;
    comments_count: number;
    title: string;
    text: string;
    is_available: boolean;
    is_liked: boolean;
    attachments: {
      id: string;
      type: string;
    }[];
    subscriptions: {
      id?: string;
      creator?: string;
      creator_name?: string;
      creator_photo?: string;
      month_cost: number;
      title: string;
      description?: string;
    }[];
  }[]>([]) 

  const {isMobile} = useDevice();

  const {lang, langCode} = useLanguage();

  const [translating, setTranslating] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const fun = async () => {
      if (isAuthenticated) {
        if (translating == true) {
          const postss = await api.getFeed()
          const postsToTranslate = postss.map(post => 
            ({title: post.title, text: post.text})
          )
          const translatedTitles = await translationService.autoTranslate(langCode, ...postsToTranslate.map(post => (post.title)))
          const translatedTextsPromises = postsToTranslate.map(post => 
            (htmlTranslator.translateHtml(post.text, langCode))
          )
          
          const translatedTexts: string[] = [];

          for (let i = 0; i < translatedTitles.length; ++i) {
            const currText = await translatedTextsPromises[i];
            translatedTexts.push(currText);
          }

          setPosts(
            posts.map((post, index) => (
              {
                ...post,
                title: translatedTitles[index],
                text: translatedTexts[index]
              }
            ))
          )
        } else {
          setPosts(
             await api.getFeed()
          )
        }
        
      }
    }

    fun();
  }, [isAuthenticated, translating])

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {lang.WELLCOME}
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          {lang.HOME_TITLE}
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setLoginModalOpen(true)}
          >
            {lang.SIGN_IN}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setRegisterModalOpen(true)}
          >
            {lang.SIGN_UP}
          </Button>
          
        </Box>

        <LoginModal
          open={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
        <RegisterModal
          open={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
        />
      </Container>
    );
  }

  const postsComponent = posts.map(post => (
    <Grid size={isMobile ? 12 : 6} key={post.id}>
        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Link to={`/author/${post.creator}`}>
            <Paper sx={{p: 2}}>
              <Box display='flex' flexDirection='row' alignItems='center'>
              <Avatar
                src={post.creator_photo != null ? `/images/user/${post.creator_photo}.jpg` : ''}
                sx={{
                  width: 40,
                  height: 40,
                  transition: 'filter 0.3s ease',
                  mr: 3
                }}
              ></Avatar>
              <Typography>{post.creator_name}</Typography>
            </Box>
            </Paper>
            
          </Link>
          
            <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
                <Typography variant="h6">
                    {post.title}
                </Typography>
            </Box>
            {post.is_available ? <div dangerouslySetInnerHTML={{ __html: post.text }} /> : <Paper> <Typography>Пост не доступен</Typography> </Paper>}
            
            {/* Отображаем аттачи, если они есть */}
            {post.attachments != null && post.attachments.length > 0 && post.is_available && (
                <Box sx={{ mt: 2 }}>
                    <Accordion>
                        <AccordionSummary>{lang.POST_ATTACHMENTS}</AccordionSummary>
                        <AccordionDetails>
                            {post.attachments?.map((attachment) => {
                            const isImage = attachment.type.startsWith('image/');
                            const isVideo = attachment.type.startsWith('video/');
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
                                                src={`/images/user/${attachment.id}.${attachment.type.replace('image/', '')}`}
                                                alt={`Attachment ${attachment.id}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        ) : isVideo ? (
                                            <video
                                                src={`/images/user/${attachment.id}.${attachment.type.replace('video/', '')}`}
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
    </Grid>
    
  ))

  return (
    <Box>
      <Grid container spacing={3}>
        {postsComponent}
      </Grid>
      {posts.length > 0 && 
        <Box sx={{position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 1500}}>
          <Fade appear={false} in={translating == undefined}>
          <Paper variant='outlined' >
            <Typography>{lang.TRANSLATING}</Typography>
            <Button color='primary' onClick={() => {setTranslating(true)}}>Да</Button>
            <Button color='secondary' onClick={() => {setTranslating(false)}}>Нет</Button>
          </Paper>
        </Fade>
        </Box>
        }
    </Box>
  );
};

export default HomePage;
