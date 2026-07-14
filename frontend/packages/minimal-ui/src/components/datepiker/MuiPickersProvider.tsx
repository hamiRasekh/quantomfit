'use client';

import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali';
import { faIR } from '@mui/x-date-pickers/locales';

type Props = { children: React.ReactNode };

export function MuiPickersProvider({ children }: Props) {
  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFnsJalali}
      localeText={faIR.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      {children}
    </LocalizationProvider>
  );
}
