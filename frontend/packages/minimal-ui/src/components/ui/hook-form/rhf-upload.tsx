import type { BoxProps } from '@mui/material/Box';
import type { UploadProps } from '../upload';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';

import { HelperText } from './help-text';
import { Upload, UploadBox, UploadAvatar } from '../upload';

// ----------------------------------------------------------------------

export type RHFUploadProps = UploadProps & {
  name: string;
  slotProps?: {
    wrapper?: BoxProps;
  };
};

export function RHFUploadAvatar({ name, slotProps, ...other }: RHFUploadProps) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const onDrop = (acceptedFiles: File[]) => {
          const value = acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        return (
          <Box {...slotProps?.wrapper}>
            <UploadAvatar value={field.value} error={!!error} onDrop={onDrop} {...other} />
            <HelperText errorMessage={error?.message} sx={{ justifyContent: 'center' }} />
          </Box>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUploadBox({ name, ...other }: RHFUploadProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox value={field.value} error={!!error} {...other} />
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFUpload({ name, multiple, helperText, ...other }: RHFUploadProps) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const uploadProps = {
          multiple,
          accept: { 'image/*': [] },
          error: !!error,
          helperText: error?.message ?? helperText,
        };

        const onDrop = (acceptedFiles: File[]) => {
          const currentValue = field.value || [];
          const value = multiple ? [...(Array.isArray(currentValue) ? currentValue : []), ...acceptedFiles] : acceptedFiles[0];

          setValue(name, value, { shouldValidate: true });
        };

        const onDelete = () => {
          setValue(name, multiple ? [] : null, { shouldValidate: true });
        };

        const onRemove = (file: File | string) => {
          if (!multiple) {
            setValue(name, null, { shouldValidate: true });
            return;
          }

          const currentValue = field.value || [];
          if (!Array.isArray(currentValue)) {
            setValue(name, [], { shouldValidate: true });
            return;
          }

          const filteredValue = currentValue.filter((item) => {
            if (item instanceof File && file instanceof File) {
              return item.name !== file.name || item.size !== file.size || item.lastModified !== file.lastModified;
            }
            if (typeof item === 'string' && typeof file === 'string') {
              return item !== file;
            }
            // Mixed types: compare by reference or other properties
            return item !== file;
          });

          setValue(name, filteredValue, { shouldValidate: true });
        };

        return <Upload {...uploadProps} value={field.value} onDrop={onDrop} onDelete={onDelete} onRemove={onRemove} {...other} />;
      }}
    />
  );
}
