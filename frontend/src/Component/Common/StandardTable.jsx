import React, { useMemo } from "react";
import SmartTable from "./SmartTable";

/**
 * StandardTable — a drop-in wrapper that adapts MUI DataGrid-style props
 * (rows, columns with headerName/renderCell/valueGetter, getRowId, loading)
 * to the project-standard SmartTable so ERP screens can be migrated with
 * minimal logic change.
 *
 * Behavior:
 *  - If any column uses field "actions" + renderCell, those custom actions are
 *    rendered as a normal column and SmartTable's built-in Actions column is hidden.
 *  - Otherwise, onPreview / onEdit props drive SmartTable's built-in Actions.
 *  - Columns with valueGetter are pre-computed so sort/filter/export work.
 */
const StandardTable = ({
  title = "",
  rows = [],
  columns = [],
  getRowId,
  onPreview,
  onEdit,
  renderExpanded,
  headerAction,
  loading = false,
  disableExpand,
  pageSize = 10,
  onRowClick,
}) => {
  const hasCustomActions = columns.some((c) => c.field === "actions" && c.renderCell);
  const useBuiltInActions = !hasCustomActions && (onPreview || onEdit);

  const processedRows = useMemo(() => {
    return rows.map((row, i) => {
      const newRow = { ...row };
      newRow.id = getRowId ? getRowId(row, i) : row.id ?? i;
      columns.forEach((col) => {
        if (col.valueGetter) {
          try {
            newRow[col.field] = col.valueGetter(newRow[col.field], newRow);
          } catch {
            newRow[col.field] = newRow[col.field];
          }
        }
      });
      return newRow;
    });
  }, [rows, columns, getRowId]);

  const mappedColumns = useMemo(() => {
    return columns.map((col) => ({
      field: col.field,
      header: col.headerName || col.field,
      align: col.type === "number" || col.align === "right" ? "right" : "left",
      width: col.width,
      render: col.renderCell
        ? (row) => col.renderCell({ row, value: row[col.field], id: row.id, field: col.field })
        : undefined,
    }));
  }, [columns]);

  const initialWidths = useMemo(() => {
    const w = {};
    mappedColumns.forEach((c) => {
      if (c.width) w[c.field] = c.width;
    });
    return w;
  }, [mappedColumns]);

  return (
    <SmartTable
      title={title}
      columns={mappedColumns}
      data={processedRows}
      initialWidths={initialWidths}
      onPreview={useBuiltInActions ? onPreview : undefined}
      onEdit={useBuiltInActions ? onEdit : undefined}
      renderExpanded={renderExpanded}
      headerAction={headerAction}
      loading={loading}
      onRowClick={onRowClick}
      disableActions={hasCustomActions ? true : !useBuiltInActions}
      disableExpand={disableExpand ?? !renderExpanded}
    />
  );
};

export default StandardTable;
