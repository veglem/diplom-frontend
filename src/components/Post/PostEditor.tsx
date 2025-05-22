import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Box, ButtonGroup, IconButton, Tooltip, Popover } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import CircleIcon from '@mui/icons-material/Circle';
import PaletteIcon from '@mui/icons-material/Palette';

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
}

const PostEditor: React.FC<PostEditorProps> = ({ content, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#000000');

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
        alignItems: 'center'
      }}>
        <ButtonGroup size="small">
          <Tooltip title="Жирный">
            <IconButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
            >
              <FormatBoldIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Курсив">
            <IconButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
            >
              <FormatItalicIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Зачеркнутый">
            <IconButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              color={editor.isActive('strike') ? 'primary' : 'default'}
            >
              <StrikethroughSIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Box>
          <Tooltip title="Выбрать цвет текста">
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

      <Box sx={{ p: 2, minHeight: 200 }}>
        <EditorContent editor={editor} style={{height: '100%'}}/>
      </Box>
    </Box>
  );
};

export default PostEditor;
