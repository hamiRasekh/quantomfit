import type { BoxProps } from '@mui/material/Box';
import type { TextFieldProps } from '@mui/material/TextField';
import type { MuiOtpInputProps } from 'mui-one-time-password-input';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';

import { MuiOtpInput } from 'mui-one-time-password-input';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import { inputBaseClasses } from '@mui/material/InputBase';

import { HelperText } from './help-text';

// ----------------------------------------------------------------------

export interface RHFCodesProps extends Omit<MuiOtpInputProps, 'sx'> {
  name: string;
  maxSize?: number;
  placeholder?: string;
  helperText?: React.ReactNode;
  slotProps?: {
    wrapper?: BoxProps;
    helperText?: FormHelperTextProps;
    textField?: MuiOtpInputProps['TextFieldsProps'];
  };
}

export function RHFCode({
  name,
  slotProps,
  helperText,
  maxSize = 56,
  placeholder = '-',
  ...other
}: RHFCodesProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Create base TextFieldsProps with numeric input mode for mobile
        const baseTextFieldsProps: TextFieldProps = {
          placeholder,
          error: !!error,
          slotProps: {
            htmlInput: {
              inputMode: 'numeric',
              pattern: '[0-9]*',
            },
          },
        };

        // Merge with user-provided textField props if it's an object
        // TextFieldsProps can be TextFieldProps object or a function (index: number) => TextFieldProps
        const textFieldsProps: MuiOtpInputProps['TextFieldsProps'] = (() => {
          const userProps = slotProps?.textField;

          // If it's a function, wrap it to add numeric input mode
          if (typeof userProps === 'function') {
            return (index: number): TextFieldProps => {
              const props = userProps(index);
              return {
                ...props,
                slotProps: {
                  ...props.slotProps,
                  htmlInput: {
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    ...props.slotProps?.htmlInput,
                  },
                },
              };
            };
          }

          // If it's an object, merge with base props
          if (userProps && typeof userProps === 'object') {
            return {
              ...userProps,
              slotProps: {
                ...userProps.slotProps,
                htmlInput: {
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  ...userProps.slotProps?.htmlInput,
                },
              },
            };
          }

          // Default: use base props
          return baseTextFieldsProps;
        })();

        return (
          <Box
            {...slotProps?.wrapper}
            sx={[
              {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                [`& .${inputBaseClasses.input}`]: {
                  p: 0,
                  height: 'auto',
                  aspectRatio: '1/1',
                  maxWidth: maxSize,
                },
              },
              ...(Array.isArray(slotProps?.wrapper?.sx)
                ? slotProps.wrapper.sx
                : [slotProps?.wrapper?.sx]),
            ]}
          >
            <MuiOtpInput
              {...field}
              gap={1.5}
              TextFieldsProps={textFieldsProps}
              {...other}
            />

            <HelperText
              {...slotProps?.helperText}
              errorMessage={error?.message}
              helperText={helperText}
            />
          </Box>
        );
      }}
    />
  );
}
