import type { DialogProps } from '@mui/material/Dialog';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

// ----------------------------------------------------------------------

type CustomDialogProps = DialogProps & {
  title?: string;
  children: React.ReactNode;
};

export function CustomDialog({
  open,
  onClose,
  title,
  children,
  maxWidth = 'md',
  fullWidth = true,
  ...other
}: CustomDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...other}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
