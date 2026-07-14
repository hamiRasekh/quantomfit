'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';

import { toast } from 'sonner';
import { Iconify } from '@/components/ui/iconify';

import { Assignment, AssignmentStatus, AssignmentTimeLog, AssignmentLogAction } from '@/features/assignments/types';
import { workerAssignmentsApi, workerAuthApi } from '@/features/worker/api';
import { WORKER_TOKEN_KEY } from '@/shared/api/worker-client';

const statusLabel: Record<AssignmentStatus, string> = {
  [AssignmentStatus.ASSIGNED]: 'واگذار شده',
  [AssignmentStatus.IN_PROGRESS]: 'در حال انجام',
  [AssignmentStatus.PAUSED]: 'متوقف شده',
  [AssignmentStatus.DONE]: 'انجام شده',
  [AssignmentStatus.COMPLETED]: 'تکمیل شده',
  [AssignmentStatus.AWAITING_APPROVAL]: 'در انتظار تایید',
  [AssignmentStatus.APPROVED]: 'تایید شده',
  [AssignmentStatus.RETURNED]: 'برگشت داده شده',
  [AssignmentStatus.CANCELLED]: 'لغو شده',
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  if (minutes > 0) {
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }
  return `${secs}ثانیه`;
};

const formatDurationReadable = (seconds: number) => {
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

const logActionLabel: Record<AssignmentLogAction, string> = {
  [AssignmentLogAction.START]: 'شروع',
  [AssignmentLogAction.PAUSE]: 'توقف',
  [AssignmentLogAction.RESUME]: 'ادامه',
  [AssignmentLogAction.COMPLETE]: 'پایان کار',
  [AssignmentLogAction.APPROVE]: 'تایید',
  [AssignmentLogAction.RETURN]: 'برگشت',
  [AssignmentLogAction.CANCEL]: 'لغو',
};

const computeCurrentSeconds = (task: Assignment) => {
  let total = task.workedSeconds || 0;
  if (task.status === AssignmentStatus.IN_PROGRESS && task.timerStartedAt) {
    const started = new Date(task.timerStartedAt).getTime();
    total += Math.max(0, Math.round((Date.now() - started) / 1000));
  }
  return total;
};

export default function WorkerTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [expandedLogTaskId, setExpandedLogTaskId] = useState<string | null>(null);
  const [taskLogs, setTaskLogs] = useState<Record<string, AssignmentTimeLog[]>>({});
  const [loadingLogs, setLoadingLogs] = useState<Record<string, boolean>>({});

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workerAssignmentsApi.list();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت لیست تسک‌ها');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(WORKER_TOKEN_KEY) : null;
    if (!token) {
      router.replace('/worker/login');
      return;
    }
    loadTasks();
  }, [router, loadTasks]);

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [loadTasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadTasks();
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (
    id: string,
    action: 'start' | 'pause' | 'resume' | 'complete',
  ) => {
    try {
      if (action === 'start') {
        await workerAssignmentsApi.start(id);
        toast.success('کار با موفقیت شروع شد');
      }
      if (action === 'pause') {
        await workerAssignmentsApi.pause(id);
        toast.success('کار متوقف شد');
      }
      if (action === 'resume') {
        await workerAssignmentsApi.resume(id);
        toast.success('کار ادامه یافت');
      }
      if (action === 'complete') {
        await workerAssignmentsApi.complete(id);
        toast.success('کار با موفقیت به پایان رسید');
      }
      await loadTasks();
    } catch (err: any) {
      const errorMsg = err.message || 'خطا در انجام عملیات';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const visibleTasks = useMemo(() => tasks, [tasks, tick]);

  const toggleLogs = useCallback(
    async (taskId: string) => {
      if (expandedLogTaskId === taskId) {
        setExpandedLogTaskId(null);
        return;
      }
      setExpandedLogTaskId(taskId);
      if (taskLogs[taskId]) return;
      setLoadingLogs((prev) => ({ ...prev, [taskId]: true }));
      try {
        const logs = await workerAssignmentsApi.getTimeLogs(taskId);
        setTaskLogs((prev) => ({ ...prev, [taskId]: logs }));
      } catch {
        toast.error('خطا در دریافت ریز لاگ');
      } finally {
        setLoadingLogs((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [expandedLogTaskId, taskLogs]
  );

  const handleLogout = async () => {
    await workerAuthApi.logout();
    router.replace('/worker/login');
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                پنل کارگر
              </Typography>
              <Typography variant="body2" color="text.secondary">
                مدیریت تسک‌های واگذار شده
              </Typography>
            </Box>
            <Button variant="outlined" color="inherit" onClick={handleLogout} startIcon={<Iconify icon="solar:logout-2-bold" />}>
              خروج
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {visibleTasks.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Iconify icon="solar:clipboard-list-bold-duotone" width={64} sx={{ mb: 2, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              فعلاً تسک فعالی برای شما ثبت نشده است
            </Typography>
            <Typography variant="body2" color="text.secondary">
              تسک‌های جدید پس از واگذاری در اینجا نمایش داده می‌شوند
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {visibleTasks.map((task) => {
            const seconds = computeCurrentSeconds(task);
            const isActive = task.status === AssignmentStatus.IN_PROGRESS;
            
            return (
              <Card
                key={task.id}
                sx={{
                  border: isActive ? 2 : 1,
                  borderColor: isActive ? 'primary.main' : 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {task.product?.name || 'محصول نامشخص'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        کد: {task.product?.code || '-'} | تعداد: {task.quantity}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusLabel[task.status] || task.status}
                      color={
                        task.status === AssignmentStatus.IN_PROGRESS
                          ? 'primary'
                          : task.status === AssignmentStatus.APPROVED
                          ? 'success'
                          : task.status === AssignmentStatus.RETURNED
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                      icon={
                        isActive ? (
                          <Iconify icon="solar:play-circle-bold" width={16} />
                        ) : task.status === AssignmentStatus.PAUSED ? (
                          <Iconify icon="solar:pause-circle-bold" width={16} />
                        ) : undefined
                      }
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Activity Info */}
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:list-check-bold" width={20} sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>فعالیت:</strong> {task.activity?.name || '-'}
                      </Typography>
                    </Stack>
                    {task.stage?.name && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:layers-bold" width={20} sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2">
                          <strong>مرحله:</strong> {task.stage.name}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  {/* Timer Display */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: isActive ? 'primary.lighter' : 'grey.100',
                      borderRadius: 2,
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      زمان کارکرد
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: isActive ? 'primary.main' : 'text.primary',
                        letterSpacing: 2,
                      }}
                    >
                      {formatDuration(seconds)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatDurationReadable(seconds)}
                    </Typography>
                    {isActive && task.timerStartedAt && (
                      <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'block' }}>
                        در حال کار...
                      </Typography>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      {[AssignmentStatus.ASSIGNED, AssignmentStatus.RETURNED].includes(task.status) && (
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<Iconify icon="solar:play-circle-bold" />}
                          onClick={() => handleAction(task.id, 'start')}
                          sx={{ py: 1.5 }}
                        >
                          شروع کار
                        </Button>
                      )}

                      {task.status === AssignmentStatus.IN_PROGRESS && (
                        <>
                          <Button
                            variant="outlined"
                            color="warning"
                            fullWidth
                            size="large"
                            startIcon={<Iconify icon="solar:pause-circle-bold" />}
                            onClick={() => handleAction(task.id, 'pause')}
                            sx={{ py: 1.5 }}
                          >
                            توقف
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            size="large"
                            startIcon={<Iconify icon="solar:check-circle-bold" />}
                            onClick={() => handleAction(task.id, 'complete')}
                            sx={{ py: 1.5 }}
                          >
                            پایان کار
                          </Button>
                        </>
                      )}

                      {task.status === AssignmentStatus.PAUSED && (
                        <>
                          <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={<Iconify icon="solar:play-circle-bold" />}
                            onClick={() => handleAction(task.id, 'resume')}
                            sx={{ py: 1.5 }}
                          >
                            ادامه کار
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            size="large"
                            startIcon={<Iconify icon="solar:check-circle-bold" />}
                            onClick={() => handleAction(task.id, 'complete')}
                            sx={{ py: 1.5 }}
                          >
                            پایان کار
                          </Button>
                        </>
                      )}

                      {task.status === AssignmentStatus.AWAITING_APPROVAL && (
                        <Alert severity="info" sx={{ width: '100%' }}>
                          منتظر تایید مدیر
                        </Alert>
                      )}
                    </Stack>
                  </CardActions>

                  <Divider sx={{ my: 1 }} />
                  <Button
                    size="small"
                    startIcon={
                      <Iconify
                        icon={expandedLogTaskId === task.id ? 'solar:minimize-square-bold' : 'solar:document-text-bold'}
                      />
                    }
                    onClick={() => toggleLogs(task.id)}
                    disabled={loadingLogs[task.id]}
                  >
                    {loadingLogs[task.id]
                      ? 'در حال بارگذاری...'
                      : expandedLogTaskId === task.id
                        ? 'بستن ریز لاگ'
                        : 'مشاهده ریز لاگ زمان'}
                  </Button>
                  <Collapse in={expandedLogTaskId === task.id}>
                    <Box sx={{ mt: 1, overflow: 'auto' }}>
                      {taskLogs[task.id]?.length ? (
                        <Table size="small">
                          <TableBody>
                            {taskLogs[task.id].map((log) => (
                              <TableRow key={log.id}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {new Date(log.createdAt).toLocaleString('fa-IR')}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={logActionLabel[log.action] || log.action}
                                    size="small"
                                    color={
                                      log.action === AssignmentLogAction.START || log.action === AssignmentLogAction.RESUME
                                        ? 'primary'
                                        : log.action === AssignmentLogAction.COMPLETE || log.action === AssignmentLogAction.APPROVE
                                          ? 'success'
                                          : 'default'
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {log.durationSeconds > 0 ? formatDurationReadable(log.durationSeconds) : '-'}
                                </TableCell>
                                <TableCell>{log.note || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          هنوز لاگی ثبت نشده است
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}


