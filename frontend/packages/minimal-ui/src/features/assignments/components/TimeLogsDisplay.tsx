'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { Iconify } from '@/components/ui/iconify';
import { assignmentsApi } from '../api/assignmentsApi';
import { AssignmentTimeLog, AssignmentLogAction } from '../types';

interface Props {
  assignmentId?: string;
  personnelId?: string;
}

const actionLabels: Record<AssignmentLogAction, string> = {
  [AssignmentLogAction.START]: 'شروع کار',
  [AssignmentLogAction.PAUSE]: 'توقف',
  [AssignmentLogAction.RESUME]: 'ادامه کار',
  [AssignmentLogAction.COMPLETE]: 'پایان کار',
  [AssignmentLogAction.APPROVE]: 'تایید',
  [AssignmentLogAction.RETURN]: 'برگشت',
  [AssignmentLogAction.CANCEL]: 'لغو',
};

const actionColors: Record<AssignmentLogAction, 'primary' | 'success' | 'warning' | 'error' | 'default'> = {
  [AssignmentLogAction.START]: 'primary',
  [AssignmentLogAction.PAUSE]: 'warning',
  [AssignmentLogAction.RESUME]: 'primary',
  [AssignmentLogAction.COMPLETE]: 'success',
  [AssignmentLogAction.APPROVE]: 'success',
  [AssignmentLogAction.RETURN]: 'error',
  [AssignmentLogAction.CANCEL]: 'error',
};

const actionIcons: Record<AssignmentLogAction, string> = {
  [AssignmentLogAction.START]: 'solar:play-circle-bold',
  [AssignmentLogAction.PAUSE]: 'solar:pause-circle-bold',
  [AssignmentLogAction.RESUME]: 'solar:play-circle-bold',
  [AssignmentLogAction.COMPLETE]: 'solar:check-circle-bold',
  [AssignmentLogAction.APPROVE]: 'solar:check-circle-bold',
  [AssignmentLogAction.RETURN]: 'solar:undo-bold',
  [AssignmentLogAction.CANCEL]: 'solar:close-circle-bold',
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}ساعت ${minutes}دقیقه`;
  }
  if (minutes > 0) {
    return `${minutes}دقیقه ${secs}ثانیه`;
  }
  return `${secs}ثانیه`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export function TimeLogsDisplay({ assignmentId, personnelId }: Props) {
  const [logs, setLogs] = useState<AssignmentTimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: AssignmentTimeLog[];
        if (assignmentId) {
          data = await assignmentsApi.getTimeLogs(assignmentId);
        } else if (personnelId) {
          data = await assignmentsApi.getPersonnelTimeLogs(personnelId);
        } else {
          setError('assignmentId یا personnelId باید مشخص باشد');
          return;
        }
        setLogs(data);
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت لاگ‌ها');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId || personnelId) {
      fetchLogs();
    }
  }, [assignmentId, personnelId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent sx={{ py: 4, textAlign: 'center' }}>
          <Iconify icon="solar:history-bold-duotone" width={48} sx={{ mb: 1, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">
            لاگی ثبت نشده است
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          تاریخچه فعالیت‌ها
        </Typography>
        <Timeline>
          {logs.map((log, index) => (
            <TimelineItem key={log.id}>
              <TimelineSeparator>
                <TimelineDot color={(actionColors[log.action] === 'default' ? 'grey' : actionColors[log.action]) as 'grey' | 'primary' | 'success' | 'warning' | 'error'}>
                  <Iconify icon={actionIcons[log.action]} width={20} />
                </TimelineDot>
                {index < logs.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Box sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip
                      label={actionLabels[log.action]}
                      color={actionColors[log.action]}
                      size="small"
                      icon={<Iconify icon={actionIcons[log.action]} width={16} />}
                    />
                    {log.durationSeconds > 0 && (
                      <Chip
                        label={formatDuration(log.durationSeconds)}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(log.createdAt)}
                  </Typography>
                </Box>
                {log.note && (
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      mt: 1,
                    }}
                  >
                    <Typography variant="body2">{log.note}</Typography>
                  </Box>
                )}
                {log.assignment && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      محصول: {log.assignment.product?.name || '-'} | فعالیت:{' '}
                      {log.assignment.activity?.name || '-'}
                    </Typography>
                  </Box>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
