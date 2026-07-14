import type { IOrderItem, StatusRoadmapItem } from '@/types/order';
import type { OrderProcessTableRow } from '@/features/admin-order-process/types';

import { useBoolean, usePopover } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import { RouterLink } from '@/ui/routes/components';

import { Label } from '@/components/ui/label';
import { Iconify } from '@/components/ui/iconify';
import { fCurrency } from '@/ui/utils/format-number';
import { useLocalizedDate } from '@/lib/hooks/use-localized-date';
import { ConfirmDialog } from '@/components/ui/custom-dialog';
import { CustomPopover } from '@/components/ui/custom-popover';
import { Canvas3DPreview } from './canvas-3d-preview';
import { OrderItemNotesTab } from './order-item-notes-tab';
import { useTranslate } from '@/components/ui/locales';
import { useOrderItemCanvas } from '@/features/admin-order-process/hooks/use-order-item-canvas';
import { CanvasView } from '@/features/canvas/components/view/canvas-view';
import { adminOrderProcessService } from '@/features/admin-order-process/services/order-process.service';

// ----------------------------------------------------------------------

type Props = {
  row: IOrderItem | OrderProcessTableRow;
  selected: boolean;
  detailsHref: string;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onStatusChange?: (rowId: string, newStatus: string) => void;
};

/**
 * Get current status from statusRoadmap
 */
function getCurrentStatus(statusRoadmap?: StatusRoadmapItem[]): { slug: string; name: string } | null {
  if (!statusRoadmap || statusRoadmap.length === 0) return null;
  const current = statusRoadmap.find((item) => item.current);
  if (current) {
    return { slug: current.slug || current.status || '', name: current.name || '' };
  }
  return null;
}

/**
 * Get status color based on status slug
 */
function getStatusColor(statusSlug: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  const statusMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    'new_order': 'info',
    'new': 'info',
    'waiting-list': 'warning',
    'waiting': 'warning',
    'supply-process': 'info',
    'supply': 'info',
    'printing-and-embroidery': 'primary',
    'print': 'primary',
    'sewing': 'secondary',
    'ironing-and-packaging': 'secondary',
    'packaging': 'secondary',
    'ready-to-ship': 'info',
    'shipping': 'info',
    'shipped': 'success',
    'delivered': 'success',
    'cancelled': 'error',
    'completed': 'success',
    'pending': 'warning',
  };
  return statusMap[statusSlug] || 'default';
}

export function OrderTableRow({ row, selected, onSelectRow, onDeleteRow, detailsHref, onStatusChange }: Props) {
  const confirmDialog = useBoolean();
  const menuActions = usePopover();
  const collapseRow = useBoolean();
  const { formatDate, formatTime } = useLocalizedDate();
  const { t } = useTranslate('adminOrderProcess');
  const [activeTab, setActiveTab] = useState(0);
  const [itemNotes, setItemNotes] = useState<string | null>(null);
  const [isLoadingItemNotes, setIsLoadingItemNotes] = useState(false);
  

  // Check if this is a product-based row (OrderProcessTableRow) or order-based row (IOrderItem)
  const isProductRow = 'itemId' in row;

  // Extract data based on row type
  const productName = isProductRow ? row.productName : '';
  const sku = isProductRow ? row.sku : '';
  const coverUrl = isProductRow ? row.coverUrl : '';
  const quantity = isProductRow ? row.quantity : (row.totalQuantity || 0);
  const price = isProductRow ? row.price : (row.subtotal || 0);
  const orderNumber = isProductRow ? row.orderNumber : row.orderNumber;
  const createdAt = isProductRow ? row.orderCreatedAt : row.createdAt;
  const customerName = isProductRow ? row.customerName : row.customer.name;
  const customerEmail = isProductRow ? row.customerEmail : row.customer.email;
  const customerAvatarUrl = isProductRow ? row.customerAvatarUrl : row.customer.avatarUrl;
  const size = isProductRow ? (row as OrderProcessTableRow).size : null;
  const deliveryMethod = isProductRow ? (row as OrderProcessTableRow).deliveryMethod : null;
  
  // Get status from statusRoadmap if available
  const statusRoadmap = isProductRow ? row.statusRoadmap : (row.items?.[0]?.statusRoadmap);
  const currentStatus = getCurrentStatus(statusRoadmap);
  const displayStatus = currentStatus?.name || currentStatus?.slug || (isProductRow ? row.orderStatus : row.status);
  const statusSlug = currentStatus?.slug || (isProductRow ? row.orderStatus : row.status);
  const statusColor = getStatusColor(statusSlug);

  const renderPrimaryRow = () => (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          slotProps={{
            input: {
              id: `${isProductRow ? (row as OrderProcessTableRow).itemId : (row as IOrderItem).id}-checkbox`,
              'aria-label': `${isProductRow ? (row as OrderProcessTableRow).itemId : (row as IOrderItem).id} checkbox`,
            },
          }}
        />
      </TableCell>

      {/* Product Column */}
      <TableCell sx={{ minWidth: 300, maxWidth: 400 }}>
        <Box sx={{ gap: 1.5, display: 'flex', alignItems: 'center' }}>
          {coverUrl ? (
            <Box
              component="img"
              src={coverUrl}
              alt={productName}
              sx={{
                width: 64,
                height: 64,
                borderRadius: 1,
                objectFit: 'cover',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:gallery-add-bold" width={24} sx={{ color: 'text.disabled' }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ListItemText
              primary={productName || 'نامشخص'}
              secondary={
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                  {sku && (
                    <Typography variant="caption" color="text.disabled">
                      شناسه: {sku}
                    </Typography>
                  )}
                  <>
                    {sku && size && (
                      <Typography variant="caption" color="text.disabled" sx={{ mx: 0.5 }}>
                        •
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      سایز: {size || 'نامشخص'}
                    </Typography>
                  </>
                </Stack>
              }
              slotProps={{
                primary: {
                  sx: { typography: 'body2', fontWeight: 600, lineHeight: 1.4, wordBreak: 'break-word' },
                },
                secondary: {
                  component: 'div',
                  sx: { mt: 0.5 },
                },
              }}
            />
          </Box>
        </Box>
      </TableCell>

      {/* Customer Column */}
      <TableCell sx={{ minWidth: 200, maxWidth: 300 }}>
          <ListItemText
          primary={customerName || 'نامشخص'}
          secondary={
            <Stack spacing={0.5}>
              {customerEmail && (
                <Typography variant="caption" color="text.disabled" sx={{ wordBreak: 'break-word' }}>
                  {customerEmail}
                </Typography>
              )}
              {isProductRow && (
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
                  روش ارسال: {deliveryMethod || 'نامشخص'}
                </Typography>
              )}
            </Stack>
          }
            slotProps={{
              primary: {
              sx: { typography: 'body2', fontWeight: 500, wordBreak: 'break-word' },
              },
              secondary: {
              component: 'div',
              sx: { mt: 0.5 },
              },
            }}
          />
      </TableCell>

      {/* Order Number Column */}
      <TableCell sx={{ minWidth: 120 }}>
        <Link component={RouterLink} href={detailsHref} color="inherit" underline="always" sx={{ fontWeight: 500 }}>
          {orderNumber ? `#${orderNumber}` : 'نامشخص'}
        </Link>
      </TableCell>

      {/* Date Column */}
      <TableCell sx={{ minWidth: 120 }}>
        <ListItemText
          primary={formatDate(createdAt as string | Date | null | undefined)}
          secondary={formatTime(createdAt as string | Date | null | undefined)}
          slotProps={{
            primary: {
              noWrap: true,
              sx: { typography: 'body2' },
            },
            secondary: {
              sx: { mt: 0.5, typography: 'caption' },
            },
          }}
        />
      </TableCell>

      {/* Quantity Column */}
      <TableCell align="center" sx={{ minWidth: 80 }}>{quantity}</TableCell>

      {/* Price Column */}
      <TableCell sx={{ minWidth: 100 }}>{fCurrency(price)}</TableCell>

      {/* Status Column */}
      <TableCell sx={{ minWidth: 150 }}>
        {isProductRow && statusRoadmap && statusRoadmap.length > 0 && onStatusChange ? (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={currentStatus?.slug || statusSlug}
              onChange={(e) => {
                if (onStatusChange) {
                  onStatusChange(isProductRow ? (row as OrderProcessTableRow).itemId : (row as IOrderItem).id, e.target.value);
                }
              }}
              sx={{
                '& .MuiSelect-select': {
                  py: 0.75,
                  px: 1.5,
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: statusColor !== 'default' ? 'currentColor' : undefined,
                },
              }}
            >
              {(() => {
                // Build flat list of statuses including children (sub-statuses)
                const flatStatuses: Array<{ item: StatusRoadmapItem; level: number; parentName?: string }> = [];
                
                const processStatuses = (items: StatusRoadmapItem[], level = 0, parentName?: string) => {
                  items.forEach((item) => {
                    flatStatuses.push({ item, level, parentName });
                    // If item has children, process them recursively
                    if ((item as any).children && Array.isArray((item as any).children)) {
                      processStatuses((item as any).children, level + 1, item.name);
                    }
                  });
                };
                
                const filteredRoadmap = statusRoadmap.filter((item) => {
                  // Only show current status and next available statuses (not completed ones before current)
                  if (item.current) return true;
                  const currentIndex = statusRoadmap.findIndex((r) => r.current);
                  const itemIndex = statusRoadmap.findIndex((r) => r.id === item.id);
                  // Show items after current, or items that are completed
                  return itemIndex > currentIndex || !!item.completed_at;
                });
                
                processStatuses(filteredRoadmap);
                
                return flatStatuses.map(({ item: roadmapItem, level, parentName }) => (
                  <MenuItem 
                    key={roadmapItem.id || roadmapItem.slug} 
                    value={roadmapItem.slug || roadmapItem.status || ''}
                    sx={{ pl: level * 2 + 2 }}
                  >
                    {level > 0 && '└ '}
                    {roadmapItem.name}
                    {roadmapItem.current && ' (فعلی)'}
                  </MenuItem>
                ));
              })()}
            </Select>
          </FormControl>
        ) : (
          <Label variant="soft" color={statusColor}>
            {displayStatus}
        </Label>
        )}
      </TableCell>

      {/* Actions Column */}
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapseRow.value ? 'inherit' : 'default'}
          onClick={collapseRow.onToggle}
          sx={{ ...(collapseRow.value && { bgcolor: 'action.hover' }) }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  // Get relevant status roadmap items (current and next few)
  const getRelevantStatusRoadmap = (roadmap: StatusRoadmapItem[] | undefined) => {
    if (!roadmap || roadmap.length === 0) return [];

    const currentIndex = roadmap.findIndex((item) => item.current);
    if (currentIndex === -1) return roadmap.slice(0, 3); // Show first 3 if no current

    // Show current, previous completed, and next 2-3 items
    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(roadmap.length, currentIndex + 4);
    return roadmap.slice(start, end);
  };

  // Use canvas hook for 3D model - must be at component level
  const productRow = isProductRow ? (row as OrderProcessTableRow) : null;
  const { modelUrl, canvasData, layers, isLoading: isLoadingCanvas } = useOrderItemCanvas();
  
  // Debug: Log canvas data
  useEffect(() => {
    if (productRow?.canvasPreview?.canvasId && productRow?.productId) {
      console.log('[OrderTableRow] Canvas Debug:', {
        canvasId: productRow.canvasPreview.canvasId,
        productId: productRow.productId,
        modelUrl,
        hasCanvasData: !!canvasData,
        layersCount: layers?.length || 0,
        isLoadingCanvas,
        canvasPreview: productRow.canvasPreview,
      });
    }
  }, [productRow?.canvasPreview?.canvasId, productRow?.productId, modelUrl, canvasData, layers, isLoadingCanvas]);

  const renderSecondaryRow = () => {
    // For product rows, show order details; for order rows, show items
    if (isProductRow) {
      const relevantRoadmap = getRelevantStatusRoadmap(statusRoadmap);
      
      // Show order and item details for product row
      return (
        <TableRow>
          <TableCell 
            sx={{ 
              p: 0, 
              border: 'none', 
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
              position: 'relative'
            }} 
            colSpan={8}
          >
            <Collapse
              in={collapseRow.value}
              timeout="auto"
              unmountOnExit
              sx={{ 
                bgcolor: 'background.neutral', 
                width: '100%', 
                maxWidth: '100%',
                display: 'block',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}
            >
              <Paper sx={{ 
                m: 1.5, 
                minWidth: 0, 
                width: 'calc(100% - 24px)', 
                maxWidth: 'calc(100% - 24px)', 
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label={t('tabs.information')} />
                    <Tab label={t('tabs.canvas')} />
                    <Tab label={t('tabs.notes')} />
                  </Tabs>
                </Box>
                
                <Box sx={{ p: 2.5, minWidth: 0, maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                  {/* Tab 0: Information */}
                  {activeTab === 0 && (
                    <Grid container spacing={3} sx={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                            اطلاعات سفارش
                          </Typography>
                          <Grid container spacing={2} sx={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">شماره سفارش</Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orderNumber || 'نامشخص'}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">مشتری</Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerName || 'نامشخص'}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">تماس</Typography>
                                <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerEmail || 'نامشخص'}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">تاریخ</Typography>
                                <Typography variant="body2">{formatDate(createdAt as string | Date | null | undefined)}</Typography>
                              </Box>
                            </Grid>
                            {/* Product SKU */}
                            {isProductRow && sku && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">شناسه محصول</Typography>
                                  <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {sku}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">قیمت محصول</Typography>
                                <Typography variant="body2" fontWeight={500}>{fCurrency(price)}</Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">تعداد</Typography>
                                <Typography variant="body2">{quantity}</Typography>
                              </Box>
                            </Grid>
                            {/* Product Size */}
                            {isProductRow && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">سایز</Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {(row as OrderProcessTableRow).size || 'نامشخص'}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {/* Order Status */}
                            {isProductRow && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">وضعیت سفارش</Typography>
                                  <Typography variant="body2" fontWeight={500}>
                                    {displayStatus || 'نامشخص'}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {/* Order Financial Summary */}
                            {isProductRow && (row as OrderProcessTableRow).orderSubtotal !== undefined && (
                              <>
                                <Grid size={{ xs: 12 }} sx={{ mt: 1, pt: 1, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>خلاصه مالی سفارش:</Typography>
                                </Grid>
                                {(row as OrderProcessTableRow).orderSubtotal !== undefined && (
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">مبلغ جزئی</Typography>
                                      <Typography variant="body2">{fCurrency((row as OrderProcessTableRow).orderSubtotal || 0)}</Typography>
                                    </Box>
                                  </Grid>
                                )}
                                {(row as OrderProcessTableRow).orderShipping !== undefined && (row as OrderProcessTableRow).orderShipping !== 0 && (
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">هزینه ارسال</Typography>
                                      <Typography variant="body2">{fCurrency((row as OrderProcessTableRow).orderShipping || 0)}</Typography>
                                    </Box>
                                  </Grid>
                                )}
                                {(row as OrderProcessTableRow).orderTaxes !== undefined && (row as OrderProcessTableRow).orderTaxes !== 0 && (
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">مالیات</Typography>
                                      <Typography variant="body2">{fCurrency((row as OrderProcessTableRow).orderTaxes || 0)}</Typography>
                                    </Box>
                                  </Grid>
                                )}
                                {(row as OrderProcessTableRow).orderDiscount !== undefined && (row as OrderProcessTableRow).orderDiscount !== 0 && (
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">تخفیف</Typography>
                                      <Typography variant="body2" color="error.main">-{fCurrency((row as OrderProcessTableRow).orderDiscount || 0)}</Typography>
                                    </Box>
                                  </Grid>
                                )}
                                {(row as OrderProcessTableRow).orderTotalAmount !== undefined && (
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ mt: 0.5, pt: 0.5, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary" fontWeight={600}>مبلغ کل</Typography>
                                      <Typography variant="body2" fontWeight={600}>{fCurrency((row as OrderProcessTableRow).orderTotalAmount || 0)}</Typography>
                                    </Box>
                                  </Grid>
                                )}
                              </>
                            )}
                            {/* Shipping Method */}
                            {isProductRow && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">روش ارسال</Typography>
                                  <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {(row as OrderProcessTableRow).deliveryMethod || 'نامشخص'}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {/* Tracking Number */}
                            {isProductRow && (row as OrderProcessTableRow).orderTrackingNumber && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">شماره پیگیری</Typography>
                                  <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {(row as OrderProcessTableRow).orderTrackingNumber}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {/* Payment Info */}
                            {isProductRow && (row as OrderProcessTableRow).orderPayment && (
                              <>
                                {(row as OrderProcessTableRow).orderPayment?.cardType && (
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">نوع کارت</Typography>
                                      <Typography variant="body2" fontWeight={500}>
                                        {(row as OrderProcessTableRow).orderPayment?.cardType || 'نامشخص'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                                {(row as OrderProcessTableRow).orderPayment?.cardNumber && (
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">شماره کارت</Typography>
                                      <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {(row as OrderProcessTableRow).orderPayment?.cardNumber || 'نامشخص'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                              </>
                            )}
                            {/* Shipping Address */}
                            {isProductRow && (row as OrderProcessTableRow).shippingAddress && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">آدرس ارسال</Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
                                    {(row as OrderProcessTableRow).shippingAddress?.fullAddress || 'نامشخص'}
                                  </Typography>
                                  {(row as OrderProcessTableRow).shippingAddress?.phoneNumber && (
                                    <Typography variant="caption" color="text.secondary">
                                      تلفن: {(row as OrderProcessTableRow).shippingAddress?.phoneNumber}
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            )}
                            {/* Customer Notes */}
                            {isProductRow && (row as OrderProcessTableRow).customerNotes && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">یادداشت مشتری</Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'error.main', wordBreak: 'break-word' }}>
                                    {(row as OrderProcessTableRow).customerNotes}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {/* Order Notes */}
                            {isProductRow && (row as OrderProcessTableRow).orderNotes && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">یادداشت سفارش</Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
                                    {(row as OrderProcessTableRow).orderNotes}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {/* Item Notes */}
                            {isProductRow && (itemNotes || isLoadingItemNotes) && (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">یادداشت محصول</Typography>
                                  {isLoadingItemNotes ? (
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                      در حال بارگذاری...
                                    </Typography>
                                  ) : itemNotes ? (
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
                                      {itemNotes}
                                    </Typography>
                                  ) : null}
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  )}

                  {/* Tab 1: Canvas */}
                  {activeTab === 1 && (
                    <Box sx={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                      {(productRow?.canvasPreview || coverUrl) ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                            پیش‌نمایش محصول
                          </Typography>
                          {/* Always use CanvasView if we have canvasId and productId - it will fetch data from frontend */}
                          {productRow?.canvasPreview?.canvasId && productRow?.productId ? (
                            <Box sx={{ 
                              height: 500, 
                              width: '100%', 
                              maxWidth: '100%',
                              borderRadius: 2, 
                              overflow: 'hidden', 
                              border: (theme) => `1px solid ${theme.palette.divider}`,
                              boxSizing: 'border-box'
                            }}>
                              {isLoadingCanvas ? (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CircularProgress />
                                </Box>
                              ) : modelUrl ? (
                                <CanvasView />
                              ) : (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                                  <Typography variant="body2" color="text.secondary" align="center">
                                    مدل سه‌بعدی در دسترس نیست
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ) : productRow?.canvasPreview?.screenshots && productRow.canvasPreview.screenshots.length > 0 ? (
                            <Stack spacing={1.5}>
                              {productRow?.canvasPreview.screenshots.map((screenshot, index) => (
                                <Box
                                  key={index}
                                  component="img"
                                  src={screenshot}
                                  alt={`${productName} - ${index === 0 ? 'جلو' : index === 1 ? 'عقب' : `تصویر ${index + 1}`}`}
                                  onError={(e) => {
                                    if (coverUrl && e.currentTarget.src !== coverUrl) {
                                      e.currentTarget.src = coverUrl;
                                    }
                                  }}
                                  sx={{
                                    width: '100%',
                                    maxHeight: 400,
                                    minHeight: 300,
                                    borderRadius: 2,
                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                    objectFit: 'contain',
                                    bgcolor: 'background.neutral',
                                  }}
                                />
                              ))}
                            </Stack>
                          ) : productRow?.canvasPreview?.snapshotUrl ? (
                            <Box
                              component="img"
                              src={productRow.canvasPreview.snapshotUrl}
                              alt={productName}
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                if (coverUrl && img.src !== coverUrl) {
                                  img.src = coverUrl;
                                }
                              }}
                              sx={{
                                width: '100%',
                                maxHeight: 400,
                                minHeight: 300,
                                borderRadius: 2,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                objectFit: 'contain',
                                bgcolor: 'background.neutral',
                              }}
                            />
                          ) : coverUrl ? (
                            <Box
                              component="img"
                              src={coverUrl}
                              alt={productName}
                              sx={{
                                width: '100%',
                                maxHeight: 400,
                                minHeight: 300,
                                borderRadius: 2,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                objectFit: 'contain',
                                bgcolor: 'background.neutral',
                              }}
                            />
                          ) : (
                            <Box sx={{ height: 400, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: 'background.neutral' }}>
                              <Typography variant="body2" color="text.secondary">
                                پیش‌نمایش محصول در دسترس نیست
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ height: 400, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: 'background.neutral' }}>
                          <Typography variant="body2" color="text.secondary">
                            پیش‌نمایش محصول در دسترس نیست
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Tab 2: Notes */}
                  {activeTab === 2 && isProductRow && productRow && (
                    <OrderItemNotesTab
                      orderId={productRow.orderId}
                      itemId={productRow.itemId}
                      orderItem={productRow}
                    />
                  )}
                </Box>
              </Paper>
            </Collapse>
          </TableCell>
        </TableRow>
      );
    }

    // Original order items display
    return (
    <TableRow>
      <TableCell 
        sx={{ 
          p: 0, 
          border: 'none', 
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }} 
        colSpan={8}
      >
        <Collapse
          in={collapseRow.value}
          timeout="auto"
          unmountOnExit
          sx={{ 
            bgcolor: 'background.neutral', 
            width: '100%', 
            maxWidth: '100%',
            display: 'block',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          <Paper sx={{ 
            m: 1.5, 
            minWidth: 0, 
            width: 'calc(100% - 24px)', 
            maxWidth: 'calc(100% - 24px)', 
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
              {row.items?.map((item) => (
                <Box
                  key={item.id}
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    p: theme.spacing(1.5, 2, 1.5, 1.5),
                    '&:not(:last-of-type)': {
                      borderBottom: `solid 2px ${theme.vars.palette.background.neutral}`,
                    },
                  })}
                >
                  <Avatar
                    src={item.coverUrl}
                    variant="rounded"
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />

                  <ListItemText
                    primary={item.name}
                    secondary={item.sku}
                    slotProps={{
                      primary: { sx: { typography: 'body2' } },
                      secondary: { sx: { color: 'text.disabled' } },
                    }}
                  />

                  <div>x{item.quantity} </div>

                  <Box sx={{ width: 110, textAlign: 'right' }}>{fCurrency(item.price)}</Box>
                </Box>
              ))}
            </Paper>
          </Collapse>
        </TableCell>
      </TableRow>
    );
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          حذف
        </MenuItem>

        <li>
          <MenuItem component={RouterLink} href={detailsHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:eye-bold" />
            مشاهده
          </MenuItem>
        </li>
      </MenuList>
    </CustomPopover>
  );

  const renderConfrimDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="حذف"
      content="آیا از حذف این مورد اطمینان دارید؟"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          حذف
        </Button>
      }
    />
  );

  return (
    <>
      {renderPrimaryRow()}
      {renderSecondaryRow()}
      {renderMenuActions()}
      {renderConfrimDialog()}
    </>
  );
}
