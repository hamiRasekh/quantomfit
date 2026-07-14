'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { Scrollbar } from '@/components/ui/scrollbar';
import { EmptyContent } from '@/components/ui/empty-content';
import { DashboardContent } from '@/components/ui/layouts/dashboard/content';
import { ConfirmDialog } from '@/components/ui/custom-dialog';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
  TableSkeleton,
} from '@/components/ui/table';

import MiniErpDashboardLayout from '@/components/ui/layouts/dashboard/mini-erp-dashboard-layout';
import { attributeValuesApi } from '@/features/attribute-values/api/attributeValuesApi';
import { AttributeValue, AttributeValueFilters, AttributeValueListParams } from '@/features/attribute-values/types';
import { AttributeValueTableRow } from '@/features/attribute-values/components/AttributeValueTableRow';
import { AttributeValueTableToolbar } from '@/features/attribute-values/components/AttributeValueTableToolbar';
import { AttributeValueTableFiltersResult } from '@/features/attribute-values/components/AttributeValueTableFiltersResult';
import { AttributeValueFormDialog } from '@/features/attribute-values/components/AttributeValueFormDialog';
import { paths } from '@/shared/routes/paths';
import { attributesApi } from '@/features/attributes/api/attributesApi';
import type { Attribute } from '@/features/attributes/types';

const TABLE_HEAD = [
  { id: 'value', label: 'مقدار' },
  { id: 'isActive', label: 'وضعیت', width: 120 },
  { id: 'createdAt', label: 'تاریخ ایجاد', width: 160 },
  { id: '', width: 88 },
];

export default function AttributeValuesPage() {
  const params = useParams();
  const attributeId = params.attributeId as string;

  const table = useTable({ defaultRowsPerPage: 10 });
  const confirmDialog = useBoolean();
  const formDialog = useBoolean();

  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [tableData, setTableData] = useState<AttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const filters = useSetState<AttributeValueFilters>({
    search: '',
    isActive: 'all',
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const canReset = !!currentFilters.search || currentFilters.isActive !== 'all';

  useEffect(() => {
    const fetchAttr = async () => {
      try {
        const res = await attributesApi.getById(attributeId);
        setAttribute(res);
      } catch (e: any) {
        toast.error(e.message || 'خطا در دریافت اطلاعات ویژگی');
      }
    };
    fetchAttr();
  }, [attributeId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: AttributeValueListParams = {
        page: table.page + 1,
        limit: table.rowsPerPage,
        search: currentFilters.search || undefined,
        isActive: currentFilters.isActive === 'all' ? undefined : currentFilters.isActive === true,
      };
      const response = await attributeValuesApi.getAllByAttribute(attributeId, params);
      setTableData(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (error: any) {
      toast.error(error.message || 'خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  }, [attributeId, table.page, table.rowsPerPage, currentFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const heading = useMemo(() => {
    if (!attribute) return 'مقادیر ویژگی';
    return `مقادیر: ${attribute.name}`;
  }, [attribute]);

  const handleDeleteRow = useCallback(async () => {
    if (!selectedId) return;
    try {
      await attributeValuesApi.delete(selectedId);
      toast.success('مقدار با موفقیت حذف شد');
      confirmDialog.onFalse();
      setSelectedId(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'خطا در حذف مقدار');
    }
  }, [selectedId, confirmDialog, fetchData]);

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => attributeValuesApi.delete(id)));
      toast.success('مقادیر با موفقیت حذف شدند');
      table.setSelected([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'خطا در حذف مقادیر');
    }
  }, [table, fetchData]);

  const handleEdit = useCallback(
    (valueItem: AttributeValue) => {
      setEditingValue(valueItem);
      formDialog.onTrue();
    },
    [formDialog],
  );

  const handleCreate = useCallback(() => {
    setEditingValue(null);
    formDialog.onTrue();
  }, [formDialog]);

  const handleFormSuccess = useCallback(() => {
    formDialog.onFalse();
    setEditingValue(null);
    fetchData();
  }, [formDialog, fetchData]);

  const handleResetFilters = useCallback(() => {
    updateFilters({ search: '', isActive: 'all' });
  }, [updateFilters]);

  return (
    <MiniErpDashboardLayout>
      <DashboardContent>
        <CustomBreadcrumbs
          heading={heading}
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'ویژگی‌ها', href: paths.attributes.list },
            { name: attribute?.name || 'مقادیر' },
          ]}
          action={
            <Button onClick={handleCreate} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>
              افزودن مقدار
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <AttributeValueTableToolbar
            filters={currentFilters}
            onFiltersChange={updateFilters}
            onResetFilters={handleResetFilters}
            canReset={canReset}
          />

          {canReset && (
            <AttributeValueTableFiltersResult
              filters={currentFilters}
              onFiltersChange={updateFilters}
              onResetFilters={handleResetFilters}
            />
          )}

          <Scrollbar fillContent={false}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 760 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id),
                  )
                }
              />

              <TableBody>
                {loading && <TableSkeleton rowCount={table.rowsPerPage} cellCount={TABLE_HEAD.length + 1} />}

                {!loading && tableData.length > 0 && (
                  <>
                    {tableData.map((row) => (
                      <AttributeValueTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => {
                          setSelectedId(row.id);
                          confirmDialog.onTrue();
                        }}
                        onEditRow={() => handleEdit(row)}
                      />
                    ))}
                    {tableData.length < table.rowsPerPage && (
                      <TableEmptyRows
                        height={table.dense ? 52 : 72}
                        emptyRows={table.rowsPerPage - tableData.length}
                        colSpan={TABLE_HEAD.length + 1}
                      />
                    )}
                  </>
                )}

                {!loading && tableData.length === 0 && !canReset && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length + 1} align="center" sx={{ py: 10 }}>
                      <EmptyContent
                        title="هیچ مقداری یافت نشد"
                        description="برای شروع، مقدار جدید اضافه کنید"
                        action={
                          <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={handleCreate}
                            sx={{ mt: 2 }}
                          >
                            افزودن مقدار
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}

                {!loading && tableData.length === 0 && canReset && (
                  <TableNoData notFound colSpan={TABLE_HEAD.length + 1} />
                )}
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom
            count={pagination.total}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>

        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={tableData.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              tableData.map((row) => row.id),
            )
          }
          action={
            <Tooltip title="حذف">
              <IconButton color="primary" onClick={handleDeleteRows}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          }
        />

        <ConfirmDialog
          open={confirmDialog.value}
          onClose={confirmDialog.onFalse}
          title="حذف"
          content="آیا از حذف این مقدار اطمینان دارید؟"
          action={
            <Button variant="contained" color="error" onClick={handleDeleteRow}>
              حذف
            </Button>
          }
        />

        <AttributeValueFormDialog
          open={formDialog.value}
          onClose={() => {
            formDialog.onFalse();
            setEditingValue(null);
          }}
          attributeId={attributeId}
          valueItem={editingValue}
          onSuccess={handleFormSuccess}
        />
      </DashboardContent>
    </MiniErpDashboardLayout>
  );
}

