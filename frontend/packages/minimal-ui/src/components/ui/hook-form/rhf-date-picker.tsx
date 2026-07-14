import type { TimePickerProps } from '@mui/x-date-pickers/TimePicker';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import type { PickersTextFieldProps } from '@mui/x-date-pickers/PickersTextField';

import { Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { toDatePickerValue, toIsoStringFromPickerValue } from '@/lib/utils/date-helpers';
import { useLocalizationContext } from '@mui/x-date-pickers/internals';

// ----------------------------------------------------------------------

type PickerProps<T extends DatePickerProps | TimePickerProps | DateTimePickerProps> = T & {
  name: string;
  slotProps?: T['slotProps'] & {
    textField?: Partial<PickersTextFieldProps>;
  };
};

export function RHFDatePicker({ name, slotProps, ...other }: PickerProps<DatePickerProps>) {
  const { control } = useFormContext();
  const { utils } = useLocalizationContext() as any;
  const adapterSample = utils?.date?.() as any;
  const adapterIsDayjs = !!adapterSample && typeof adapterSample?.isValid === 'function';
  const preferDate = !adapterIsDayjs;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const { ref, value, onChange, onBlur } = field;
        
        // Filter out any unwanted props that might come from field or other sources
        const safeOther = other || {};
        const {
          preprocessor,
          ...safeOtherProps
        } = safeOther as any;

        const normalizedValue = toDatePickerValue(value, preferDate);

        return (
          <DatePicker
            value={normalizedValue}
            onChange={(newValue) => {
              onChange(toIsoStringFromPickerValue(newValue));
            }}
            onBlur={onBlur}
            slotProps={{
              ...slotProps,
              textField: {
                ...slotProps?.textField,
                error: !!error,
                helperText: error?.message ?? slotProps?.textField?.helperText,
                inputRef: ref,
              },
            }}
            {...safeOtherProps}
          />
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFTimePicker({ name, slotProps, ...other }: PickerProps<TimePickerProps>) {
  const { control } = useFormContext();
  const { utils } = useLocalizationContext() as any;
  const adapterSample = utils?.date?.() as any;
  const adapterIsDayjs = !!adapterSample && typeof adapterSample?.isValid === 'function';
  const preferDate = !adapterIsDayjs;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const { ref, value, onChange, onBlur } = field;
        
        // Filter out any unwanted props that might come from field or other sources
        const safeOther = other || {};
        const {
          preprocessor,
          ...safeOtherProps
        } = safeOther as any;

        const normalizedValue = toDatePickerValue(value, preferDate);

        return (
          <TimePicker
            value={normalizedValue}
            onChange={(newValue) => {
              onChange(toIsoStringFromPickerValue(newValue));
            }}
            onBlur={onBlur}
            slotProps={{
              ...slotProps,
              textField: {
                ...slotProps?.textField,
                error: !!error,
                helperText: error?.message ?? slotProps?.textField?.helperText,
                inputRef: ref,
              },
            }}
            {...safeOtherProps}
          />
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFDateTimePicker({ name, slotProps, ...other }: PickerProps<DateTimePickerProps>) {
  const { control } = useFormContext();
  const { utils } = useLocalizationContext() as any;
  const adapterSample = utils?.date?.() as any;
  const adapterIsDayjs = !!adapterSample && typeof adapterSample?.isValid === 'function';
  const preferDate = !adapterIsDayjs;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const { ref, value, onChange, onBlur } = field;
        
        // Filter out any unwanted props that might come from field or other sources
        const safeOther = other || {};
        const {
          preprocessor,
          ...safeOtherProps
        } = safeOther as any;

        const normalizedValue = toDatePickerValue(value, preferDate);

        return (
          <DateTimePicker
            value={normalizedValue}
            onChange={(newValue) => {
              onChange(toIsoStringFromPickerValue(newValue));
            }}
            onBlur={onBlur}
            slotProps={{
              ...slotProps,
              textField: {
                ...slotProps?.textField,
                error: !!error,
                helperText: error?.message ?? slotProps?.textField?.helperText,
                inputRef: ref,
              },
            }}
            {...safeOtherProps}
          />
        );
      }}
    />
  );
}
