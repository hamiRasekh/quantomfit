'use client';

import Alert, { AlertProps } from '@mui/material/Alert';

/** Alert اطلاع‌رسانی — استایل دارک‌مود از تم tenant (getTenantAlertComponents) */
export function TenantInfoAlert({ children, sx, ...rest }: AlertProps) {
  return (
    <Alert
      severity="info"
      sx={{
        borderRadius: 2,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Alert>
  );
}
