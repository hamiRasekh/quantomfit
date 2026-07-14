'use client';

import type { ThemeOptions } from './types';

import { createPaletteChannel } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

export const themeOverrides: ThemeOptions = {
  colorSchemes: {
    light: {
      palette: {
        primary: createPaletteChannel({
          lighter: '#F0E8FF',
          light: '#C4B5FD',
          main: '#6E25FF',
          dark: '#5B21B6',
          darker: '#3A1A75',
          contrastText: '#FFFFFF',
        }),
      },
    },
    dark: {
      palette: {
        primary: createPaletteChannel({
          lighter: '#F0E8FF',
          light: '#C4B5FD',
          main: '#6E25FF',
          dark: '#5B21B6',
          darker: '#3A1A75',
          contrastText: '#FFFFFF',
        }),
      },
    },
  },
};
