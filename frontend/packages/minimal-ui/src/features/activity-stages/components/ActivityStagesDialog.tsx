'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';

import { Iconify } from '@/components/ui/iconify';
import { EmptyContent } from '@/components/ui/empty-content';
import { ConfirmDialog } from '@/components/ui/custom-dialog';

import { Activity } from '@/features/activities/types';
import { ActivityStage } from '../types';
import { activityStagesApi } from '../api/activityStagesApi';
import { StageFormDialog } from './StageFormDialog';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

type Props = {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
};

type StageFormState =
  | { mode: 'create'; parent?: ActivityStage | null }
  | { mode: 'edit'; stage: ActivityStage };

export function ActivityStagesDialog({ open, onClose, activity }: Props) {
  const [stages, setStages] = useState<ActivityStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<StageFormState | null>(null);
  const deleteDialog = useBoolean();
  const [selectedStage, setSelectedStage] = useState<ActivityStage | null>(null);

  const fetchStages = useCallback(async () => {
    if (!activity) return;
    try {
      setLoading(true);
      const data = await activityStagesApi.listByActivity(activity.id);
      setStages(data);
    } catch (error: any) {
      notifyApiError(error, 'خطا در دریافت مراحل فعالیت');
    } finally {
      setLoading(false);
    }
  }, [activity]);

  useEffect(() => {
    if (open && activity) {
      fetchStages();
    } else if (!open) {
      setStages([]);
      setFormState(null);
      setSelectedStage(null);
    }
  }, [open, activity, fetchStages]);

  const handleOpenCreateRoot = () => {
    setFormState({ mode: 'create', parent: null });
  };

  const handleOpenCreateChild = (parent: ActivityStage) => {
    setFormState({ mode: 'create', parent });
  };

  const handleOpenEdit = (stage: ActivityStage) => {
    setFormState({ mode: 'edit', stage });
  };

  const handleDeleteStage = (stage: ActivityStage) => {
    setSelectedStage(stage);
    deleteDialog.onTrue();
  };

  const confirmDelete = async () => {
    if (!selectedStage) return;
    try {
      await activityStagesApi.delete(selectedStage.id);
      toast.success('مرحله حذف شد');
      deleteDialog.onFalse();
      setSelectedStage(null);
      fetchStages();
    } catch (error: any) {
      notifyApiError(error, 'خطا در حذف مرحله');
    }
  };

  const handleSubmitStage = async (values: any) => {
    if (!activity) return;
    try {
      if (formState?.mode === 'create') {
        await activityStagesApi.create({
          activityId: activity.id,
          name: values.name,
          description: values.description || undefined,
          sequence: values.sequence,
          durationMinutes: values.durationMinutes,
          isOptional: values.isOptional,
          parentId: formState.parent?.id,
        });
        toast.success('مرحله جدید ثبت شد');
      } else if (formState?.mode === 'edit') {
        await activityStagesApi.update(formState.stage.id, {
          name: values.name,
          description: values.description || undefined,
          sequence: values.sequence,
          durationMinutes: values.durationMinutes,
          isOptional: values.isOptional,
        });
        toast.success('مرحله به‌روزرسانی شد');
      }
      setFormState(null);
      fetchStages();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره مرحله');
    }
  };

  const renderTree = useMemo(() => {
    if (loading) {
      return (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      );
    }

    if (!stages.length) {
      return <EmptyContent title="هنوز مرحله‌ای ثبت نشده است" sx={{ py: 4 }} />;
    }

    const renderNode = (stage: ActivityStage) => (
      <TreeItem
        key={stage.id}
        nodeId={stage.id}
        label={
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ pr: 1 }}
          >
            <Box>
              <Typography variant="subtitle2">{stage.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {stage.description || 'بدون توضیح'}
              </Typography>
              <Box sx={{ mt: 0.5, color: 'text.secondary', typography: 'caption' }}>
                {`ترتیب: ${stage.sequence}`} {stage.durationMinutes ? ` • زمان: ${stage.durationMinutes} دقیقه` : ''}
                {stage.isOptional ? ' • اختیاری' : ''}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => handleOpenCreateChild(stage)}>
                <Iconify icon="solar:add-circle-bold" width={18} />
              </IconButton>
              <IconButton size="small" onClick={() => handleOpenEdit(stage)}>
                <Iconify icon="solar:pen-bold" width={18} />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteStage(stage)}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              </IconButton>
            </Box>
          </Stack>
        }
      >
        {stage.children?.map((child) => renderNode(child))}
      </TreeItem>
    );

    return (
      <TreeView
        defaultCollapseIcon={<Iconify icon="solar:minus-square-bold" width={18} />}
        defaultExpandIcon={<Iconify icon="solar:plus-square-bold" width={18} />}
        sx={{ flexGrow: 1, overflow: 'auto' }}
      >
        {stages.map((stage) => renderNode(stage))}
      </TreeView>
    );
  }, [stages, loading]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          مدیریت مراحل فعالیت {activity?.name ? `- ${activity.name}` : ''}
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={handleOpenCreateRoot}
              disabled={!activity}
            >
              افزودن مرحله جدید
            </Button>
          </Box>
          {renderTree}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>بستن</Button>
        </DialogActions>
      </Dialog>

      <StageFormDialog
        open={!!formState}
        onClose={() => setFormState(null)}
        onSubmit={handleSubmitStage}
        title={formState?.mode === 'edit' ? 'ویرایش مرحله' : 'مرحله جدید'}
        parentName={
          formState && formState.mode === 'create'
            ? formState.parent?.name ?? null
            : null
        }
        defaultValues={
          formState?.mode === 'edit'
            ? {
                name: formState.stage.name,
                description: formState.stage.description,
                sequence: formState.stage.sequence,
                durationMinutes: formState.stage.durationMinutes,
                isOptional: formState.stage.isOptional,
              }
            : undefined
        }
      />

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        title="حذف مرحله"
        content="آیا از حذف این مرحله اطمینان دارید؟ مراحل زیرمجموعه نیز حذف می‌شوند."
        action={
          <Button variant="contained" color="error" onClick={confirmDelete}>
            حذف
          </Button>
        }
      />
    </>
  );
}


