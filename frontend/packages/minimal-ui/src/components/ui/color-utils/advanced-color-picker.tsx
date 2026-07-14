'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load heavy color picker UI (react-colorful)
// @ts-ignore - react-colorful may not be installed
const HexColorPicker = dynamic<any>(() => import('react-colorful').then(m => m.HexColorPicker).catch(() => ({ default: () => null })), { ssr: false });
// @ts-ignore - react-colorful may not be installed
const Hue = dynamic<any>(() => import('react-colorful').then(m => m.Hue).catch(() => ({ default: () => null })), { ssr: false });

export type AdvancedColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
};

function clampHex(hex: string): string {
  const v = hex.trim();
  if (!v) return '#000000';
  const prefixed = v.startsWith('#') ? v : `#${v}`;
  const valid = /^#[0-9A-Fa-f]{3,6}$/.test(prefixed);
  return valid ? prefixed : '#000000';
}

export function AdvancedColorPicker({ value, onChange }: AdvancedColorPickerProps) {
  const [input, setInput] = useState<string>(value.toUpperCase());
  const hex = useMemo(() => clampHex(value), [value]);

  const handleHexChange = useCallback((v: string) => {
    setInput(v.toUpperCase());
    const normalized = clampHex(v);
    if (normalized !== hex) {
      onChange(normalized);
    }
  }, [hex, onChange]);

  return (
    <Stack spacing={1.25} sx={{ width: { xs: 300, sm: 360 } }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        انتخاب رنگ
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
        <Box sx={{ position: 'relative', borderRadius: 1.5, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
          <HexColorPicker color={hex} onChange={onChange} />
        </Box>
        <Box sx={{ px: 1.5 }}>
          <Hue color={hex} onChange={onChange} />
        </Box>
      </Box>

      <Divider />

      <Stack direction="row" spacing={1}>
        <TextField
          label="HEX"
          value={input}
          onChange={(e) => handleHexChange(e.target.value)}
          onBlur={(e) => handleHexChange(e.target.value)}
          fullWidth
          size="small"
          inputProps={{ spellCheck: false }}
        />
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            bgcolor: hex,
            alignSelf: 'center',
          }}
        />
      </Stack>
    </Stack>
  );
}

export default AdvancedColorPicker;


