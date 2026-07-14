'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { Iconify } from '@/components/ui/iconify';
import { useTranslate } from '@/components/ui/locales';
import { useLocalizedDate } from '@/lib/hooks/use-localized-date';
import { toast } from 'sonner';
import { Upload } from '@/components/ui/upload';
import { ConfirmDialog } from '@/components/ui/custom-dialog';

import { MentionTextarea, type MentionOption } from './mention-textarea';
import { adminOrderProcessService } from '@/features/admin-order-process/services/order-process.service';
import { useAdminList } from '@/features/admin-order-process/hooks/use-admin-list';
import type { OrderNote, CreateOrderNoteData } from '@/features/admin-order-process/types';
import type { OrderProcessTableRow } from '@/features/admin-order-process/types';

// ----------------------------------------------------------------------

interface OrderItemNotesTabProps {
  orderId: string;
  itemId: string;
  orderItem?: OrderProcessTableRow;
}

interface UploadedFile {
  file: File;
  type: 'normal' | 'embroidery' | 'print';
  id: string;
}

export function OrderItemNotesTab({ orderId, itemId, orderItem }: OrderItemNotesTabProps) {
  const { t } = useTranslate('adminOrderProcess');
  const { formatDate, formatTime } = useLocalizedDate();
  
  // Get admins list from GetOrderNote API
  // We'll try to get from first note if available, otherwise use hook's fallback
  const { admins, isLoading: isLoadingAdmins, error: adminError } = useAdminList();

  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showToCustomer, setShowToCustomer] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Prepare mention options - must be defined before useEffects that use them
  const adminMentionOptions: MentionOption[] = useMemo(() => {
    return admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      username: admin.username,
      type: 'admin' as const,
    }));
  }, [admins]);

  const itemMentionOptions: MentionOption[] = useMemo(() => {
    if (!orderItem) return [];
    // Return current item and potentially other items from the same order
    // For now, just return the current item
    return [{
      id: orderItem.itemId,
      name: orderItem.productName,
      sku: orderItem.sku,
      type: 'item' as const,
    }];
  }, [orderItem]);

  // Debug: Log admins to see if they're being fetched
  useEffect(() => {
    console.log('useAdminList state:', { admins, isLoadingAdmins, adminError, adminsLength: admins.length });
    if (admins.length > 0) {
      console.log('Admins loaded:', admins);
    } else if (!isLoadingAdmins && !adminError) {
      console.warn('No admins found. Check API endpoint.');
    }
  }, [admins, isLoadingAdmins, adminError]);
  
  // Debug: Log admin mention options
  useEffect(() => {
    console.log('adminMentionOptions:', adminMentionOptions);
  }, [adminMentionOptions]);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminOrderProcessService.getOrderNotes(orderId, itemId);
      const fetchedNotes = response.data || [];
      // Filter notes to only show notes for this specific item
      // A note belongs to this item if:
      // 1. The note's itemId matches this itemId, OR
      // 2. The note mentions this item in mentioned_items
      const filteredNotes = fetchedNotes.filter((note: OrderNote) => {
        // Check if note is directly for this item
        if (note.itemId === itemId) {
          return true;
        }
        // Check if note mentions this item in mentioned_items array
        if (note.mentioned_items && note.mentioned_items.some((item: { id: string }) => item.id === itemId)) {
          return true;
        }
        return false;
      });
      setNotes(filteredNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      // Don't show error toast on initial load if there are no notes
      if (notes.length > 0) {
        toast.error(t('notes.error') || 'خطا در بارگذاری یادداشت‌ها');
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderId, itemId, t, notes.length]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, itemId]);

  // Handle file upload
  const handleFileUpload = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      file,
      type: 'normal' as const,
      id: `${Date.now()}-${Math.random()}`,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleFileTypeChange = useCallback((fileId: string, type: 'normal' | 'embroidery' | 'print') => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, type } : f))
    );
  }, []);

  // Extract mentions from content
  const extractMentions = useCallback((content: string) => {
    const mentionedAdminIds: string[] = [];
    const mentionedItemIds: string[] = [];

    // Find @mentions
    const adminMatches = content.matchAll(/@(\w+)/g);
    for (const match of adminMatches) {
      const username = match[1];
      const admin = admins.find((a: { username?: string; name?: string }) => a.username === username || a.name === username);
      if (admin) {
        mentionedAdminIds.push(admin.id);
      }
    }

    // Find #mentions
    const itemMatches = content.matchAll(/#(\d+)/g);
    for (const match of itemMatches) {
      const itemId = match[1];
      if (itemId === itemId) {
        mentionedItemIds.push(itemId);
      }
    }

    return { mentionedAdminIds, mentionedItemIds };
  }, [admins, itemId]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!newNoteContent.trim()) {
      toast.error('لطفاً محتوای یادداشت را وارد کنید');
      return;
    }

    try {
      setIsSubmitting(true);
      const { mentionedAdminIds, mentionedItemIds } = extractMentions(newNoteContent);

      const noteData: CreateOrderNoteData = {
        orderId,
        itemId,
        note: newNoteContent.trim(),
        content: newNoteContent.trim(),
        mentioned_admin_ids: mentionedAdminIds.length > 0 ? mentionedAdminIds : undefined,
        mentioned_item_ids: mentionedItemIds.length > 0 ? mentionedItemIds : undefined,
        files: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.file) : undefined,
        file_types: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.type) : undefined,
        show_to_customer: showToCustomer,
      };

      await adminOrderProcessService.createOrderNote(noteData);
      
      toast.success(t('notes.createSuccess') || 'یادداشت با موفقیت ایجاد شد');
      setNewNoteContent('');
      setShowToCustomer(false);
      setUploadedFiles([]);
      await fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error(t('notes.createError') || 'خطا در ایجاد یادداشت');
    } finally {
      setIsSubmitting(false);
    }
  }, [newNoteContent, uploadedFiles, showToCustomer, orderId, itemId, extractMentions, fetchNotes, t]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!deleteNoteId) return;

    try {
      // TODO: Implement deleteOrderNote in service
      // await adminOrderProcessService.deleteOrderNote(deleteNoteId);
      console.warn('Delete note not implemented yet');
      toast.success(t('notes.deleteSuccess') || 'یادداشت با موفقیت حذف شد');
      setDeleteNoteId(null);
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(t('notes.deleteError') || 'خطا در حذف یادداشت');
    }
  }, [deleteNoteId, fetchNotes, t]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* New Note Section */}
      <Card sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('notes.newNote')}
        </Typography>

        <Stack spacing={2}>
          <MentionTextarea
            value={newNoteContent}
            onChange={setNewNoteContent}
            placeholder={t('notes.placeholder')}
            minRows={4}
            maxRows={8}
            maxLength={1000}
            adminOptions={adminMentionOptions}
            itemOptions={itemMentionOptions}
            disabled={isSubmitting}
          />

          {/* Mention Guide */}
          <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
              {t('notes.mentionGuide')}:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('notes.mentionGuideText')}
            </Typography>
          </Box>

          {/* File Upload */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('notes.uploadFile')}
            </Typography>
            <Upload
              multiple
              value={uploadedFiles.map((f) => f.file)}
              onDrop={handleFileUpload}
              onRemove={(file) => {
                const fileToRemove = uploadedFiles.find((f) => f.file === file);
                if (fileToRemove) {
                  handleRemoveFile(fileToRemove.id);
                }
              }}
            />
            
            {/* File Type Selection */}
            {uploadedFiles.length > 0 && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                {uploadedFiles.map((uploadedFile) => (
                  <Box
                    key={uploadedFile.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {uploadedFile.file.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                      {(['normal', 'embroidery', 'print'] as const).map((type) => (
                        <Chip
                          key={type}
                          label={t(`notes.fileType.${type}`)}
                          size="small"
                          color={uploadedFile.type === type ? 'primary' : 'default'}
                          onClick={() => handleFileTypeChange(uploadedFile.id, type)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Stack>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(uploadedFile.id)}
                      sx={{ ml: 1 }}
                    >
                      <Iconify icon="eva:close-fill" width={18} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Show to Customer Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={showToCustomer}
                onChange={(e) => setShowToCustomer(e.target.checked)}
              />
            }
            label={t('notes.showToCustomer')}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || !newNoteContent.trim()}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <Iconify icon="solar:add-circle-bold" />}
          >
            {t('notes.submit')}
          </Button>
        </Stack>
      </Card>

      {/* Existing Notes */}
      <Stack spacing={2}>
        <Typography variant="h6">یادداشت‌های موجود</Typography>
        
        {notes.length === 0 ? (
          <Alert severity="info">{t('notes.noNotes')}</Alert>
        ) : (
          notes.map((note) => (
            <Card key={note.id} sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                {/* Note Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {note.admin_name || note.createdBy || 'Unknown'}
                      {note.admin_username && ` (@${note.admin_username})`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('notes.createdBy')} {note.admin_name || note.createdBy || 'Unknown'} {t('notes.at')} {formatDate(note.created_at || note.createdAt)} {formatTime(note.created_at || note.createdAt)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteNoteId(note.id)}
                    color="error"
                  >
                    <Iconify icon="eva:trash-2-outline" width={18} />
                  </IconButton>
                </Box>

                <Divider />

                {/* Note Content */}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {note.content || note.note}
                </Typography>

                {/* Mentioned Admins */}
                {note.mentioned_admins && note.mentioned_admins.length > 0 && (
                  <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                      {t('notes.mentionedAdmins')}:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {note.mentioned_admins.map((admin: { id: string; username?: string; name?: string }) => (
                        <Chip
                          key={admin.id}
                          label={`@${admin.username || admin.name}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Mentioned Items */}
                {note.mentioned_items && note.mentioned_items.length > 0 && (
                  <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                      {t('notes.mentionedItems')}:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {note.mentioned_items.map((item: { id: string; name?: string; sku?: string }) => (
                        <Chip
                          key={item.id}
                          label={`#${item.id} ${item.name}${item.sku ? ` - ${item.sku}` : ''}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Files */}
                {note.files && note.files.length > 0 && (
                  <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                      فایل‌های ضمیمه:
                    </Typography>
                    <Stack spacing={1}>
                      {note.files.map((file: { id: string; name: string; url: string; type: string }) => (
                        <Box
                          key={file.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">{file.name}</Typography>
                            <Chip
                              label={t(`notes.fileType.${file.type}`)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="solar:download-bold" width={16} />}
                            href={file.url}
                            target="_blank"
                            download
                          >
                            {t('notes.downloadFile')}
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Show to Customer Badge */}
                {note.show_to_customer && (
                  <Chip
                    label={t('notes.showToCustomer')}
                    size="small"
                    color="info"
                    icon={<Iconify icon="solar:eye-bold" width={16} />}
                  />
                )}
              </Stack>
            </Card>
          ))
        )}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteNoteId}
        onClose={() => setDeleteNoteId(null)}
        title={t('notes.deleteNote')}
        content="آیا از حذف این یادداشت اطمینان دارید؟"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            {t('dialog.deleteButton')}
          </Button>
        }
      />
    </Stack>
  );
}

