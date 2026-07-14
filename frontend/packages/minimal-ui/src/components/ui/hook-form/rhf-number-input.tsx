'use client';

import * as React from 'react';
import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';

type Props = Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'defaultValue'> & {
  name: string;
  helperText?: React.ReactNode;
  /**
   * متن برچسب فیلد (برای سازگاری با استفاده‌های قبلی)
   * اگر `label` در props ارسال نشده باشد، از این مقدار استفاده می‌شود.
   */
  captionText?: string;
  /**
   * محدودیت‌های عددی (صرفاً برای UI/HTML). اعتبارسنجی واقعی بهتر است در zod انجام شود.
   */
  min?: number;
  max?: number;
  step?: number;
  /**
   * اگر true باشد، مقدار در فرم به صورت number ذخیره می‌شود.
   * اگر false باشد، مقدار در فرم به صورت string عددی (بدون کاما) ذخیره می‌شود.
   */
  storeAsNumber?: boolean;
};

function digitsOnly(raw: string) {
  // هم اعداد انگلیسی هم فارسی/عربی را به انگلیسی تبدیل می‌کند و غیرعدد را حذف می‌کند
  const normalized = raw
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d]/g, '');
  return normalized;
}

function formatWithCommas(digits: string) {
  if (!digits) return '';
  // حذف صفرهای اضافه ابتدای عدد (اختیاری)
  const cleaned = digits.replace(/^0+(?=\d)/, '');
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function RHFNumberInput({
                                      name,
                                      helperText,
                                      captionText,
                                      min,
                                      max,
                                      step,
                                      storeAsNumber = true,
                                      inputProps,
                                      ...other
                                    }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // value داخل فرم: number یا string (بدون کاما)
        const rawValue =
          field.value === null || field.value === undefined ? '' : String(field.value);

        const displayValue = formatWithCommas(digitsOnly(rawValue));

        return (
          <TextField
            {...other}
            label={other.label ?? captionText}
            value={displayValue}
            error={!!error}
            helperText={error?.message ?? helperText}
            // ظاهر مثل بقیه متن‌ها، ولی فقط عدد
            inputMode="numeric"
            type="text"
            onChange={(e) => {
              const digits = digitsOnly(e.target.value);

              if (digits === '') {
                field.onChange(storeAsNumber ? null : '');
                return;
              }

              field.onChange(storeAsNumber ? Number(digits) : digits);
            }}
            onBlur={field.onBlur}
            inputRef={field.ref}
            inputProps={{
              ...inputProps,
              min,
              max,
              step,
              // جلوگیری از تایپ کاراکترهای غیرمجاز (باز هم onChange پاکسازی می‌کند)
              onKeyDown: (ev: React.KeyboardEvent<HTMLInputElement>) => {
                const allowed = [
                  'Backspace',
                  'Delete',
                  'ArrowLeft',
                  'ArrowRight',
                  'Home',
                  'End',
                  'Tab',
                ];
                if (allowed.includes(ev.key)) return;

                // اجازه Ctrl/Cmd+A/C/V/X
                if ((ev.ctrlKey || ev.metaKey) && ['a', 'c', 'v', 'x'].includes(ev.key.toLowerCase())) {
                  return;
                }

                // فقط 0-9
                if (!/^\d$/.test(ev.key)) {
                  ev.preventDefault();
                }
              },
            }}
          />
        );
      }}
    />
  );
}
