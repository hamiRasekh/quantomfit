'use client';

import type { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  loginFieldLabelSx,
  loginOutlinedInputSx,
} from '@/shared/theme/login-page-theme';

// ----------------------------------------------------------------------

type Props = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  endAdornment?: ReactNode;
};

export function IndustrialLoginField({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  endAdornment,
}: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Stack spacing={0.75}>
          <Typography component="label" htmlFor={name} sx={loginFieldLabelSx()}>
            {label}
          </Typography>

          <OutlinedInput
            {...field}
            id={name}
            fullWidth
            type={type}
            placeholder={placeholder}
            error={!!error}
            autoComplete={autoComplete}
            endAdornment={endAdornment}
            style={{ direction: 'ltr' }}
            inputProps={{
              dir: 'ltr',
              style: { textAlign: 'left' },
            }}
            sx={loginOutlinedInputSx()}
          />

          {error?.message ? (
            <FormHelperText error sx={{ mx: 0, textAlign: 'left' }}>
              {error.message}
            </FormHelperText>
          ) : null}
        </Stack>
      )}
    />
  );
}
