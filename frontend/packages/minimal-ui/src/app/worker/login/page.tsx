'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import { workerAuthApi } from '@/features/worker/api';

export default function WorkerLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!mobile.trim() || !password.trim()) {
        setError('لطفاً شماره موبایل و رمز عبور را وارد کنید');
        setLoading(false);
        return;
      }
      await workerAuthApi.login(mobile.trim(), password);
      router.push('/worker/tasks');
    } catch (err: any) {
      let errorMessage = 'خطا در ورود. لطفاً اطلاعات را بررسی کنید';
      
      if (err?.response?.data) {
        const data = err.response.data;
        if (Array.isArray(data.message)) {
          errorMessage = data.message[0] || errorMessage;
        } else if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5" textAlign="center">
          ورود پرسنل
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="شماره موبایل"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="رمز"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'در حال ورود...' : 'ورود'}
        </Button>
      </Paper>
    </Box>
  );
}


