'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import { useBoolean } from 'minimal-shared/hooks';

import { Iconify } from '@/components/ui/iconify';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { EmptyContent } from '@/components/ui/empty-content';
import { CustomDialog } from '@/components/ui/custom-dialog';

import { assignmentsApi } from '../api/assignmentsApi';
import { Assignment, AssignmentStatus } from '../types';
import { TimeLogsDisplay } from './TimeLogsDisplay';
import { fDate } from '@/components/ui/utils/format-time';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

type Props = {
  orderId: string;
};

export function AssignmentMonitoring({ orderId }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const logDialog = useBoolean();

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await assignmentsApi.getAll({
        page: 1,
        limit: 500,
      });
      const all = response?.data || [];
      // Backend does not support orderId filter; filter by orderId on client
      const forOrder = all.filter((a) => a.orderId === orderId);
      setAssignments(forOrder);
    } catch (error: any) {
      console.error('Error fetching assignments', {
        message: error?.message,
        statusCode: error?.statusCode,
        error: error?.error,
        response: error?.response,
        fullError: error,
        stack: error?.stack,
      });
      // Set empty array on error to prevent UI issues
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // در حال کار (همین الان): فقط IN_PROGRESS
  const inProgressNow = assignments.filter((a) => a.status === AssignmentStatus.IN_PROGRESS);
  // واگذاری‌هایی که الان انجام نمی‌دن: بقیه
  const notInProgressNow = assignments.filter((a) => a.status !== AssignmentStatus.IN_PROGRESS);

  const groupedInProgress = inProgressNow.reduce((acc, assignment) => {
    const personnelId = assignment.personnelId;
    const personnelName = assignment.personnel
      ? `${assignment.personnel.firstName} ${assignment.personnel.lastName}`
      : 'نامشخص';
    if (!acc[personnelId]) {
      acc[personnelId] = { personnelId, personnelName, assignments: [] };
    }
    acc[personnelId].assignments.push(assignment);
    return acc;
  }, {} as Record<string, { personnelId: string; personnelName: string; assignments: Assignment[] }>);

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.IN_PROGRESS:
        return 'primary';
      case AssignmentStatus.ASSIGNED:
        return 'default';
      case AssignmentStatus.PAUSED:
        return 'warning';
      case AssignmentStatus.AWAITING_APPROVAL:
        return 'info';
      case AssignmentStatus.APPROVED:
        return 'success';
      case AssignmentStatus.RETURNED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: AssignmentStatus) => {
    const labels: Record<AssignmentStatus, string> = {
      [AssignmentStatus.ASSIGNED]: 'واگذار شده',
      [AssignmentStatus.IN_PROGRESS]: 'در حال انجام',
      [AssignmentStatus.PAUSED]: 'متوقف شده',
      [AssignmentStatus.DONE]: 'انجام شده',
      [AssignmentStatus.COMPLETED]: 'تکمیل شده',
      [AssignmentStatus.AWAITING_APPROVAL]: 'در انتظار تایید',
      [AssignmentStatus.APPROVED]: 'تایید شده',
      [AssignmentStatus.RETURNED]: 'بازگشت شده',
      [AssignmentStatus.CANCELLED]: 'لغو شده',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ py: 4 }}>
            <LoadingScreen />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const renderAssignmentItem = (assignment: Assignment) => (
    <ListItem
      key={assignment.id}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
      }}
    >
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">
              {assignment.product?.name || 'محصول نامشخص'}
            </Typography>
            <Chip
              label={getStatusLabel(assignment.status)}
              color={getStatusColor(assignment.status)}
              size="small"
            />
          </Stack>
        }
        secondary={
          <Box>
            <Typography variant="caption" display="block">
              {assignment.activity?.name || 'فعالیت نامشخص'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              تعداد: {assignment.quantity}
            </Typography>
            {assignment.startedAt && (
              <Typography variant="caption" color="text.secondary" display="block">
                شروع: {fDate(assignment.startedAt)}
              </Typography>
            )}
          </Box>
        }
      />
      <IconButton
        size="small"
        onClick={() => {
          setSelectedAssignmentId(assignment.id);
          logDialog.onTrue();
        }}
      >
        <Iconify icon="solar:history-bold" />
      </IconButton>
    </ListItem>
  );

  return (
    <Card>
      <CardHeader
        title="مانیتورینگ کارمندها"
        action={
          <IconButton onClick={fetchData} disabled={refreshing} size="small">
            <Iconify icon="solar:refresh-bold" />
          </IconButton>
        }
      />
      <CardContent>
        {assignments.length === 0 ? (
          <Box sx={{ py: 4 }}>
            <EmptyContent
              title="هیچ واگذاری فعالی وجود ندارد"
              description="هنوز هیچ کاری به کارمندها واگذار نشده است"
            />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* در حال کار (همین الان) */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                در حال کار (الان)
              </Typography>
              {inProgressNow.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  در این لحظه کسی در حال انجام کار نیست
                </Typography>
              ) : (
                <List dense>
                  {Object.values(groupedInProgress).map((group) => (
                    <Box key={group.personnelId}>
                      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        {group.personnelName}
                      </Typography>
                      {group.assignments.map(renderAssignmentItem)}
                    </Box>
                  ))}
                </List>
              )}
            </Box>

            <Divider />

            {/* واگذاری‌هایی که الان انجام نمی‌دن */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                سایر واگذاری‌ها
              </Typography>
              {notInProgressNow.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  واگذاری دیگری وجود ندارد
                </Typography>
              ) : (
                <List dense>
                  {notInProgressNow.map(renderAssignmentItem)}
                </List>
              )}
            </Box>

            <Box sx={{ pt: 1 }}>
              <Button
                component={Link}
                href={paths.assignments.orders.assignmentsList(orderId)}
                variant="soft"
                color="primary"
                endIcon={<Iconify icon="solar:arrow-right-bold" />}
                fullWidth
              >
                نمایش بیشتر (همه واگذاری‌های این پروژه)
              </Button>
            </Box>
          </Stack>
        )}
      </CardContent>

      <CustomDialog
        open={logDialog.value}
        onClose={logDialog.onFalse}
        title="تاریخچه فعالیت‌ها"
        maxWidth="md"
        fullWidth
      >
        {selectedAssignmentId && <TimeLogsDisplay assignmentId={selectedAssignmentId} />}
      </CustomDialog>
    </Card>
  );
}
