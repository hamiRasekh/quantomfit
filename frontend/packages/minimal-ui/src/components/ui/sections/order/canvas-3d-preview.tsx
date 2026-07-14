'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Iconify } from '@/components/ui/iconify';

// ----------------------------------------------------------------------

interface Canvas3DPreviewProps {
  canvasId?: string | number;
  canvasUrl?: string;
  height?: number;
  screenshots?: string[];
}

/**
 * Canvas 3D Preview Component
 * Displays canvas in an iframe or shows screenshots with link to canvas
 */
export function Canvas3DPreview({
  canvasId,
  canvasUrl,
  height = 300,
  screenshots,
}: Canvas3DPreviewProps) {
  // If canvas URL is available, show iframe with canvas
  if (canvasUrl) {
    return (
      <Box
        sx={{
          width: '100%',
          height,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.neutral',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          position: 'relative',
        }}
      >
        <Box
          component="iframe"
          src={canvasUrl}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Canvas Preview"
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '12px',
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          مشاهده مدل سه‌بعدی
        </Box>
      </Box>
    );
  }

  // If canvas ID is available, construct canvas URL and show in iframe
  if (canvasId) {
    // Construct canvas URL from ID (assuming format: /canvas/design/{canvasId})
    const canvasDesignUrl = `/canvas/design/${canvasId}`;
    const finalCanvasUrl = canvasUrl || canvasDesignUrl;
    
    return (
      <Box
        sx={{
          width: '100%',
          height,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.neutral',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          position: 'relative',
        }}
      >
        <Box
          component="iframe"
          src={finalCanvasUrl}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Canvas 3D Preview"
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '12px',
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          مشاهده مدل سه‌بعدی
        </Box>
      </Box>
    );
  }

  // Fallback: show message
  return (
    <Box
      sx={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.neutral',
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        مدل سه‌بعدی در دسترس نیست
      </Typography>
    </Box>
  );
}

