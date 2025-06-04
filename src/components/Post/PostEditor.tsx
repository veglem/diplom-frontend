import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Grid from '@mui/material/GridLegacy';
import { Box, ButtonGroup, IconButton, Tooltip, Popover, Divider, Typography } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import DeleteIcon from '@mui/icons-material/Delete';

const COLORS = [
  '#000000', // Черный
  '#FF0000', // Красный
  '#00FF00', // Зеленый
  '#0000FF', // Синий
  '#FFFF00', // Желтый
  '#FF00FF', // Пурпурный
  '#00FFFF', // Голубой
  '#808080', // Серый
  '#FFA500', // Оранжевый
];

interface PostEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAttachmentsChange?: (attachments: File[]) => void;
  attachments?: File[];
}

const PostEditor: React.FC<PostEditorProps> = ({ 
  content, 
  onChange, 
  onAttachmentsChange,
  attachments = []
}) => {
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});

  // Создаем URL превью для файлов
  React.useEffect(() => {
    const urls: { [key: string]: string } = {};
    
    attachments.forEach(file => {
      if (!previewUrls[file.name]) {
        urls[file.name] = URL.createObjectURL(file);
      }
    });
    
    if (Object.keys(urls).length > 0) {
      setPreviewUrls(prev => ({ ...prev, ...urls }));
    }
    
    // Очистка URL при размонтировании
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [attachments]);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !onAttachmentsChange) return;
    
    const newAttachments = [...attachments];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Проверяем, что файл - изображение или видео
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newAttachments.push(file);
      }
    }
    
    onAttachmentsChange(newAttachments);
    
    // Сбрасываем значение input, чтобы можно было загрузить тот же файл повторно
    event.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    if (!onAttachmentsChange) return;
    
    const newAttachments = [...attachments];
    
    // Освобождаем URL превью
    const file = newAttachments[index];
    if (previewUrls[file.name]) {
      URL.revokeObjectURL(previewUrls[file.name]);
      setPreviewUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[file.name];
        return newUrls;
      });
    }
    
    newAttachments.splice(index, 1);
    onAttachmentsChange(newAttachments);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ 
        p: 1, 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ButtonGroup size="small">
            <Tooltip title={lang.EDITOR_BOLD}>
              <IconButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                color={editor.isActive('bold') ? 'primary' : 'default'}
              >
                <FormatBoldIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={lang.EDITOR_ITALIC}>
              <IconButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                color={editor.isActive('italic') ? 'primary' : 'default'}
              >
                <FormatItalicIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={lang.EDITOR_STRIKETHROUGH}>
              <IconButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                color={editor.isActive('strike') ? 'primary' : 'default'}
              >
                <StrikethroughSIcon />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <Box>
            <Tooltip title={lang.EDITOR_COLOR}>
              <IconButton
                onClick={(event) => setAnchorEl(event.currentTarget)}
                color={editor.isActive('textStyle', { color: currentColor }) ? 'primary' : 'default'}
              >
                <PaletteIcon sx={{ color: currentColor }} />
              </IconButton>
            </Tooltip>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Box sx={{ 
                p: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 0.5,
                width: 120
              }}>
                {COLORS.map((color) => (
                  <IconButton
                    key={color}
                    size="small"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setCurrentColor(color);
                      setAnchorEl(null);
                    }}
                    sx={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      border: currentColor === color ? '2px solid #000' : 'none',
                      backgroundColor: color,
                      '&:hover': {
                        backgroundColor: color,
                        opacity: 0.8
                      }
                    }}
                  />
                ))}
              </Box>
            </Popover>
          </Box>
        </Box>

        <Box>
          <Tooltip title={lang.EDITOR_ADD_IMAGE}>
            <IconButton onClick={handleImageUpload}>
              <ImageIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={lang.EDITOR_ADD_VIDEO}>
            <IconButton onClick={handleVideoUpload}>
              <VideocamIcon />
            </IconButton>
          </Tooltip>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
            multiple
          />
          <input
            type="file"
            ref={videoInputRef}
            style={{ display: 'none' }}
            accept="video/*"
            onChange={handleFileChange}
            multiple
          />
        </Box>
      </Box>

      <Box sx={{ p: 2, minHeight: 200 }}>
        <EditorContent editor={editor} style={{height: '100%'}}/>
      </Box>

      {attachments.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" gutterBottom>
            {lang.EDITOR_ATTACHMENTS} ({attachments.length})
          </Typography>
          <Grid container spacing={2}>
            {attachments.map((file, index) => (
              <Grid item xs={6} sm={4} md={3} key={`${file.name}-${index}`}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    height: 150,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  {file.type.startsWith('image/') ? (
                    <img
                      src={previewUrls[file.name]}
                      alt={file.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : file.type.startsWith('video/') ? (
                    <video
                      src={previewUrls[file.name]}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      controls
                    />
                  ) : null}
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PostEditor;
