
import { createTheme, Theme } from '@mui/material/styles';

type ThemeWithName = Theme & {
  name: string,
}

const themeWithName = (theme: Theme, themeName: string): ThemeWithName => { return {...theme, name: themeName} }

// Создаем тему MUI
const themes = {
  lb: themeWithName(createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1565c0',
      },
      secondary: {
        main: '#ff5722',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
  }), "lb"),
  db: themeWithName(createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#1565c0',
      },
      secondary: {
        main: '#ff5722',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
  }), 'db')
}

export default themes;
