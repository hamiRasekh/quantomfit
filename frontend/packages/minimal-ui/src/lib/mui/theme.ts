'use client';

import { alpha, createTheme } from '@mui/material/styles';
import { faIR } from '@mui/material/locale';

export const theme = createTheme(
  {
    direction: 'rtl',
    palette: {
      mode: 'light',
      primary: {
        main: '#04044A',
        light: '#2E2E78',
        dark: '#020227',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0356C5',
      },
      background: {
        default: '#F4F8FF',
        paper: '#FFFFFF',
      },
    },
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: [
        'IRANSansX',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            direction: 'rtl',
            background: 'linear-gradient(180deg, #F8FBFF 0%, #EEF5FF 100%)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 700,
          },
          containedPrimary: {
            boxShadow: `0 8px 24px ${alpha('#0D6EFD', 0.3)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: '0 6px 24px rgba(13, 110, 253, 0.08)',
          },
        },
      },
    },
  },
  faIR
);
