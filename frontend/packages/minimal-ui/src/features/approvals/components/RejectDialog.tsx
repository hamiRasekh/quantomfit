'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isBulk?: boolean;
  count?: number;
};

export function RejectDialog({ open, onClose, onConfirm, isBulk = false, count = 0 }: Props) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      return; // Require reason
    }
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>رد {isBulk ? `${count} مورد` : 'ثبت فعالیت'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="دلیل رد (الزامی)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            error={!reason.trim()}
            helperText={!reason.trim() ? 'لطفاً دلیل رد را وارد کنید' : ''}
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>انصراف</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={!reason.trim()}
        >
          رد
        </Button>
      </DialogActions>
    </Dialog>
  );
}
