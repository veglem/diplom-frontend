import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Paper, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider, 
  Card, 
  CardContent, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress
} from "@mui/material";
import Grid from '@mui/material/GridLegacy';
import { useAuth } from "../contexts/AuthContext";
import { useDevice } from "../utils/DeviceContext";
import { BaseAvatar } from "../components/Avatar/BaseAvatar";
import { useNavigate } from "react-router-dom";
import { writerService } from "../services/writerService";
import { db } from "../utils/db";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { api } from "../utils/api";
import { useLanguage } from "../contexts/LanguageContext";

// Интерфейс для автора
interface Author {
  creator_id: string;
  name: string;
  profile_photo?: string;
  description?: string;
  followers_count?: number;
}

const FollowsPage: React.FC = () => {
  const { user } = useAuth();
  const { isMobile } = useDevice();
  const navigate = useNavigate();
  
  const [follows, setFollows] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const {lang} = useLanguage();
  
  
  
  // Загрузка подписок пользователя
  useEffect(() => {
    const fetchFollows = async () => {
      if (user) {
        try {
          const followsList = (await api.getFollows()).map(follow => ({
            creator_id: follow.creator,
            name: follow.creator_name,
            profile_photo: follow.creator_photo,
            description: follow.description
          } as ({
            creator_id: string;
            name: string;
            profile_photo: string | undefined;
            description: string | undefined;
        } | null)))
          setFollows(followsList.filter(Boolean) as Author[]);
        } catch (error) {
          console.error('Ошибка при загрузке подписок:', error);
        }
      }
      setLoading(false);
    };
    
    fetchFollows();
  }, [user]);
  
  
  // Открытие поиска
  const handleOpenSearch = () => {
    setSearchOpen(true);
  };
  
  // Закрытие поиска
  const handleCloseSearch = () => {
    setSearchOpen(false);
  };
  
  // Переход на страницу автора
  const handleAuthorClick = (authorId: string) => {
    navigate(`/author/${authorId}`);
  };
  
  // Компонент карточки автора
  const AuthorCard: React.FC<{ author: Author }> = ({ author }) => {
    return (
      <Card 
      variant='outlined'
        sx={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }} 
        onClick={() => handleAuthorClick(author.creator_id)}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <BaseAvatar 
            src={author.profile_photo || ''} 
            username={author.name} 
            size={isMobile ? 'small' : 'small-L'} 
          />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
            {author.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            
          </Typography>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Paper variant='outlined' sx={{p: 1}}>
          <Typography variant="h5" component="h1">
          {lang.MY_FOLLOWS}
        </Typography>
        </Paper>
        <IconButton 
          color="primary" 
          onClick={handleOpenSearch}
          sx={{ 
            bgcolor: 'background.paper', 
            boxShadow: 1,
            '&:hover': { boxShadow: 2 }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : follows.length > 0 ? (
        <Grid container spacing={2}>
          {follows.map((author) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={author.creator_id}>
              <AuthorCard author={author} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper variant='outlined' sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {lang.YOU_DONT_HAVE_FOLLOWS}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {lang.CLICK_TO_SEARCH}
          </Typography>
        </Paper>
      )}
      
      <SearchDialog open={searchOpen} onClose={handleCloseSearch} />
    </Box>
  );
};

const SearchDialog: React.FC<{open: boolean, onClose: () => void}> = ({open, onClose}) => {
  const [searchResults, setSearchResults] = useState<Author[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useDevice();
  const {lang} = useLanguage();
  const searchTimerRef = useRef<number | null>(null);
  // Реф для поля ввода
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Функция поиска с дебаунсом
  const debouncedSearch = useCallback((query: string) => {
    // Очищаем предыдущий таймер, если он есть
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    // Устанавливаем новый таймер
    searchTimerRef.current = setTimeout(async () => {
      if (query.trim().length > 0) {
        setSearchLoading(true);
        try {
          const results = (await api.searchCreators(query)).map(res => ({
            creator_id: res.creator_id,
            user_id: res.user_id,
            name: res.name,
            cover_photo: res.cover_photo,
            followers_count: res.followers_count,
            description: res.description,
            posts_count: res.posts_count,
            profile_photo: res.profile_photo
          }) as {
            creator_id: string;
            user_id: string;
            name: string;
            cover_photo: string | undefined;
            followers_count: number;
            description: string | undefined;
            posts_count: number;
            profile_photo: string | undefined;
        })
          setSearchResults(results);
        } catch (error) {
          console.error('Ошибка при поиске авторов:', error);
        } finally {
          setSearchLoading(false);
        }
      } else {
        const reses = (await api.getAllCreators()).map(res => ({
          creator_id: res.creator_id,
            user_id: res.user_id,
            name: res.name,
            cover_photo: res.cover_photo,
            followers_count: res.followers_count,
            description: res.description,
            posts_count: res.posts_count,
            profile_photo: res.profile_photo
        }) as {
            creator_id: string;
            user_id: string;
            name: string;
            cover_photo: string | undefined;
            followers_count: number;
            description: string | undefined;
            posts_count: number;
            profile_photo: string | undefined;
        })
        setSearchResults(reses);
      }
    }, 300); // Задержка в 300 мс
  }, []);

  useEffect(() => {
    const fun = async () => {
      const reses = (await api.getAllCreators()).map(res => ({
          creator_id: res.creator_id,
            user_id: res.user_id,
            name: res.name,
            cover_photo: res.cover_photo,
            followers_count: res.followers_count,
            description: res.description,
            posts_count: res.posts_count,
            profile_photo: res.profile_photo
        }) as {
            creator_id: string;
            user_id: string;
            name: string;
            cover_photo: string | undefined;
            followers_count: number;
            description: string | undefined;
            posts_count: number;
            profile_photo: string | undefined;
        })
        setSearchResults(reses);
    }
    fun()
  }, [])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleAuthorClick = (authorId: string) => {
    navigate(`/author/${authorId}`);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        variant: 'outlined',
        sx: {
          position: 'absolute',
          top: isMobile ? 16 : 64,
          m: 0,
          width: '100%',
          maxHeight: 'calc(100% - 96px)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <TextField
          fullWidth
          variant="standard"
          placeholder={lang.SEARCH_WRITERS}
          value={searchQuery}
          onChange={handleSearchInputChange}
          autoFocus
          inputRef={inputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            disableUnderline: true,
            sx: { fontSize: '1.1rem', pl: 1 }
          }}
        />
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {searchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : searchResults.length > 0 ? (
          <List>
            {searchResults.map((author) => (
              <React.Fragment key={author.creator_id}>
                <ListItem onClick={() => handleAuthorClick(author.creator_id)} sx={{ cursor: 'pointer' }}>
                  <ListItemAvatar>
                    <BaseAvatar 
                      src={author.profile_photo || ''} 
                      username={author.name} 
                      size="small" 
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    sx={{paddingLeft: 2}}
                    primary={author.name} 
                    secondary={`${author.followers_count ?? 0} ${lang.SUBSCRUBERS}`} 
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : searchQuery.trim() !== "" ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {lang.NO_WRITERS}
            </Typography>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  )};

export default FollowsPage;
