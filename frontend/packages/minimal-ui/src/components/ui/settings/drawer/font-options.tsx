import type { BoxProps } from '@mui/material/Box';
import type { SliderProps } from '@mui/material/Slider';
import type { SettingsState } from '../types';

import { setFont } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Slider, { sliderClasses } from '@mui/material/Slider';

import { OptionButton } from './styles';

// ----------------------------------------------------------------------

export type FontFamilyOption = {
  value: string;
  label: string;
  previewText?: string;
  language?: 'fa' | 'en' | 'both';
};

type PrimitiveFontOption = string | FontFamilyOption;

export type FontFamilyOptionsProps = BoxProps & {
  options: PrimitiveFontOption[];
  icon?: React.ReactNode;
  value: SettingsState['fontFamily'];
  onChangeOption: (newOption: string) => void;
  renderIcon?: (option: FontFamilyOption) => React.ReactNode;
};

const normalizeOption = (option: PrimitiveFontOption): FontFamilyOption =>
  typeof option === 'string'
    ? { value: option, label: option }
    : {
        value: option.value,
        label: option.label,
        previewText: option.previewText ?? option.label,
        language: option.language,
      };

export function FontFamilyOptions({
  sx,
  icon,
  value,
  options,
  onChangeOption,
  renderIcon,
  ...other
}: FontFamilyOptionsProps) {
  return (
    <Box
      sx={[
        {
          gap: 1.5,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {options.map((optionItem) => {
        const option = normalizeOption(optionItem);
        const selected = value === option.value;

        return (
          <OptionButton
            key={option.value}
            selected={selected}
            onClick={() => onChangeOption(option.value)}
            sx={(theme) => ({
              py: 2,
              gap: 0.75,
              flexDirection: 'column',
              fontFamily: setFont(option.value),
              fontSize: theme.typography.pxToRem(12),
              textAlign: 'center',
            })}
          >
            {renderIcon ? renderIcon(option) : icon}
            {option.label.endsWith('Variable') ? option.label.replace(' Variable', '') : option.label}
          </OptionButton>
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------

export type FontSizeOptionsProps = SliderProps & {
  options: [number, number];
  value: SettingsState['fontSize'];
  onChangeOption: (newOption: number) => void;
};

export function FontSizeOptions({
  sx,
  value,
  options,
  onChangeOption,
  ...other
}: FontSizeOptionsProps) {
  return (
    <Box
      sx={{
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      <Slider
        marks
        step={1}
        size="small"
        valueLabelDisplay="auto"
        aria-label="Change font size"
        valueLabelFormat={(val) => `${val}px`}
        value={value}
        min={options[0]}
        max={options[1]}
        onChange={(_event: Event, newOption: number | number[]) => onChangeOption(newOption as number)}
        sx={[
          (theme) => ({
            [`& .${sliderClasses.rail}`]: {
              height: 12,
            },
            [`& .${sliderClasses.track}`]: {
              height: 12,
              background: `linear-gradient(135deg, ${theme.vars.palette.primary.light}, ${theme.vars.palette.primary.dark})`,
            },
            [`& .${sliderClasses.thumb}`]: {
              width: 22,
              height: 22,
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              '&::before': {
                // increase hit target for easier dragging on touch
                boxShadow: '0 0 0 10px rgba(0,0,0,0)',
              },
            },
            [`& .${sliderClasses.mark}`]: {
              display: 'none',
            },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      />
    </Box>
  );
}
