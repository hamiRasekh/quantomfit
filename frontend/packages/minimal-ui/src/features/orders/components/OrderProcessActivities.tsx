'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from '@/components/ui/iconify';

import { processesApi } from '@/features/processes/api/processesApi';
import { Process } from '@/features/processes/types';
import { activityCategoriesApi } from '@/features/activity-categories/api/activityCategoriesApi';
import { ActivityCategory } from '@/features/activity-categories/types';
import { activitiesApi } from '@/features/activities/api/activitiesApi';
import { Activity } from '@/features/activities/types';
import { ordersApi } from '@/features/orders/api/ordersApi';

// ----------------------------------------------------------------------

interface ProcessActivitySelection {
  id?: string;
  processId: string;
  activityIds: string[];
}

// ----------------------------------------------------------------------

export function OrderProcessActivities() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'processActivities',
  });

  const [processes, setProcesses] = useState<Process[]>([]);
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>([]);
  const [activitiesByProcess, setActivitiesByProcess] = useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(true);
  const [addByProcessOpen, setAddByProcessOpen] = useState(false);
  const [addByCategoryOpen, setAddByCategoryOpen] = useState(false);
  const [selectedProcessForAdd, setSelectedProcessForAdd] = useState<Process | null>(null);
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<ActivityCategory | null>(null);
  const [expandLoading, setExpandLoading] = useState(false);

  const processActivities = watch('processActivities') || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [processesRes, categoriesRes] = await Promise.all([
          processesApi.getAll({ limit: 500, isActive: true }),
          activityCategoriesApi.getAll({ limit: 500, isActive: true }),
        ]);
        setProcesses(processesRes.data ?? processesRes);
        setActivityCategories(categoriesRes.data ?? categoriesRes);
      } catch (error) {
        console.error('Error fetching processes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load activities by processId for existing rows (edit mode) and when process is selected. Returns activities.
  const loadActivitiesForProcess = useCallback(
    async (processId: string): Promise<Activity[]> => {
      if (!processId) return [];
      if (activitiesByProcess[processId]) return activitiesByProcess[processId];
      try {
        const res = await activitiesApi.getAll({
          limit: 500,
          isActive: true,
          processId,
        });
        const data = res.data ?? res;
        setActivitiesByProcess((prev) => ({ ...prev, [processId]: data }));
        return data;
      } catch (error) {
        console.error('Error fetching activities for process', error);
        return [];
      }
    },
    [activitiesByProcess]
  );

  useEffect(() => {
    processActivities.forEach((pa: ProcessActivitySelection) => {
      if (pa?.processId) loadActivitiesForProcess(pa.processId);
    });
  }, [processActivities, loadActivitiesForProcess]);

  const handleAddByProcess = useCallback(() => {
    setSelectedProcessForAdd(null);
    setAddByProcessOpen(true);
  }, []);

  const handleConfirmAddByProcess = useCallback(async () => {
    if (!selectedProcessForAdd) return;
    const activities = await loadActivitiesForProcess(selectedProcessForAdd.id);
    const allIds = activities.map((a) => a.id);
    append({
      processId: selectedProcessForAdd.id,
      activityIds: allIds,
    });
    setAddByProcessOpen(false);
    setSelectedProcessForAdd(null);
  }, [selectedProcessForAdd, append, loadActivitiesForProcess]);

  const handleAddByCategory = useCallback(() => {
    setSelectedCategoryForAdd(null);
    setAddByCategoryOpen(true);
  }, []);

  const handleConfirmAddByCategory = useCallback(async () => {
    if (!selectedCategoryForAdd) return;
    try {
      setExpandLoading(true);
      const rows = await ordersApi.expandByCategory(selectedCategoryForAdd.id);
      const current = watch('processActivities') || [];
      const byProcess = new Map<string, string[]>();
      current.forEach((pa: ProcessActivitySelection) => {
        if (pa.processId) {
          const existing = byProcess.get(pa.processId) ?? [];
          const merged = [...new Set([...existing, ...(pa.activityIds ?? [])])];
          byProcess.set(pa.processId, merged);
        }
      });
      rows.forEach((r) => {
        const existing = byProcess.get(r.processId) ?? [];
        const merged = [...new Set([...existing, ...r.activityIds])];
        byProcess.set(r.processId, merged);
      });
      const newList = Array.from(byProcess.entries()).map(([processId, activityIds]) => ({
        processId,
        activityIds,
      }));
      setValue('processActivities', newList);
      setAddByCategoryOpen(false);
      setSelectedCategoryForAdd(null);
    } catch (error) {
      console.error('Error expanding by category', error);
    } finally {
      setExpandLoading(false);
    }
  }, [selectedCategoryForAdd, watch, setValue]);

  const getActivitiesForRow = useCallback(
    (index: number): Activity[] => {
      const pa = processActivities[index];
      if (!pa?.processId) return [];
      return activitiesByProcess[pa.processId] ?? [];
    },
    [processActivities, activitiesByProcess]
  );

  const toggleActivity = useCallback(
    (index: number, activityId: string) => {
      const currentIds = processActivities[index]?.activityIds || [];
      const newIds = currentIds.includes(activityId)
        ? currentIds.filter((id: string) => id !== activityId)
        : [...currentIds, activityId];
      setValue(`processActivities.${index}.activityIds`, newIds);
    },
    [processActivities, setValue]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'text.disabled' }}>
          فرایندها و فعالیت‌ها
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddByProcess}
            disabled={loading}
          >
            افزودن بر اساس فرایند
          </Button>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddByCategory}
            disabled={loading}
          >
            افزودن بر اساس دسته‌بندی
          </Button>
        </Stack>
      </Box>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((field, index) => {
          const processActivity = processActivities[index];
          const selectedProcess = processes.find((p) => p.id === processActivity?.processId);
          const availableActivities = getActivitiesForRow(index);
          const selectedActivityIds = processActivity?.activityIds || [];

          return (
            <Box key={field.id}>
              <Box
                sx={{
                  gap: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'flex-end' },
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ minWidth: 120, pt: 1 }}>
                  فرایند: {selectedProcess?.name ?? '-'}
                </Typography>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => remove(index)}
                  sx={{ flexShrink: 0 }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>

              {availableActivities.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                    فعالیت‌ها (کلیک برای فعال/غیرفعال):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableActivities.map((activity) => {
                      const isSelected = selectedActivityIds.includes(activity.id);
                      return (
                        <Box
                          key={activity.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleActivity(index, activity.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleActivity(index, activity.id);
                            }
                          }}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 40,
                            px: 2,
                            borderRadius: 2,
                            border: '2px solid',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                            ...(isSelected
                              ? {
                                  backgroundColor: '#2e7d32',
                                  color: '#ffffff',
                                  borderColor: '#1b5e20',
                                  boxShadow: '0 2px 8px rgba(46, 125, 50, 0.35)',
                                  '&:hover': {
                                    backgroundColor: '#1b5e20',
                                    borderColor: '#1b5e20',
                                    color: '#ffffff',
                                    boxShadow: '0 3px 12px rgba(46, 125, 50, 0.45)',
                                  },
                                }
                              : {
                                  backgroundColor: '#f5f5f5',
                                  color: '#616161',
                                  borderColor: '#bdbdbd',
                                  '&:hover': {
                                    backgroundColor: '#e0e0e0',
                                    borderColor: '#9e9e9e',
                                    color: '#424242',
                                  },
                                }),
                          }}
                        >
                          {activity.name}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {processActivity?.processId && availableActivities.length === 0 && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                  هیچ فعالیتی برای این فرایند یافت نشد
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>

      {fields.length === 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            color: 'text.secondary',
          }}
        >
          هیچ فرایندی اضافه نشده است. از دکمه‌های بالا استفاده کنید.
        </Box>
      )}

      <Dialog open={addByProcessOpen} onClose={() => setAddByProcessOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>افزودن بر اساس فرایند</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={processes}
            value={selectedProcessForAdd}
            getOptionLabel={(option) => `${option.name}${option.code ? ` (${option.code})` : ''}`}
            onChange={(_, newValue) => setSelectedProcessForAdd(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="فرایند" placeholder="انتخاب فرایند..." size="small" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddByProcessOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleConfirmAddByProcess} disabled={!selectedProcessForAdd}>
            افزودن
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addByCategoryOpen} onClose={() => setAddByCategoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>افزودن بر اساس دسته‌بندی فعالیت</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={activityCategories}
            value={selectedCategoryForAdd}
            getOptionLabel={(option) => `${option.name}${option.code ? ` (${option.code})` : ''}`}
            onChange={(_, newValue) => setSelectedCategoryForAdd(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="دسته‌بندی فعالیت" placeholder="انتخاب دسته‌بندی..." size="small" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddByCategoryOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            onClick={handleConfirmAddByCategory}
            disabled={!selectedCategoryForAdd || expandLoading}
          >
            {expandLoading ? 'در حال بارگذاری...' : 'افزودن'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
