import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  columnFilteringFeature, createFilteredRowModel, createSortedRowModel,
  filterFn_includesString, rowSelectionFeature, rowSortingFeature,
  sortFn_alphanumeric, sortFn_basic, tableFeatures, useTable, type ColumnDef, type RowSelectionState,
} from '@tanstack/react-table';
import { TextField } from '../TextField';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { GridChoice, GridIconButton, GridSelect, type GridOption } from './GridControls';
import styles from './DataGrid.module.css';

export type GridCellType = 'text' | 'number' | 'no' | 'text-edit' | 'number-edit' | 'text-edit-search' | 'number-edit-search' | 'text-select' | 'chip';
export interface GridColumn<T> {
  id: string;
  header: string;
  value: (row: T) => string | number | boolean | null;
  type?: GridCellType;
  width?: number;
  group?: string;
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  options?: GridOption[];
  placeholder?: string;
  /** Search stays a visual affordance until the consumer supplies its lookup flow. */
  onSearch?: (row: T) => void;
  /** Sum is computed from the currently filtered rows, including disabled rows. */
  footer?: 'sum' | { label: string };
}
export interface DataGridProps<T> {
  label: string;
  rows: T[];
  columns: GridColumn<T>[];
  getRowId: (row: T) => string;
  getRowDisabled?: (row: T) => boolean;
  selection?: 'multiple' | 'single' | 'none';
  onSelectionChange?: (ids: string[]) => void;
  onCellChange?: (rowId: string, columnId: string, value: string | number | boolean | null) => void;
  emptyMessage?: string;
  className?: string;
}

const features = tableFeatures({
  columnFilteringFeature,
  filterFns: { includesString: filterFn_includesString },
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  sortedRowModel: createSortedRowModel(),
  rowSelectionFeature,
});

export function DataGrid<T extends object>({ label, rows, columns, getRowId, getRowDisabled, selection = 'multiple', onSelectionChange, onCellChange, emptyMessage = '조회 결과가 없습니다.', className }: DataGridProps<T>) {
  const id = useId();
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const definitions = useMemo(() => {
    const result: ColumnDef<typeof features, T>[] = [];
    const groups = new Map<string, ColumnDef<typeof features, T>[]>();
    if (selection !== 'none') result.push({ id: '__selection', header: '선택', enableSorting: false, enableColumnFilter: false });
    for (const column of columns) {
      const definition: ColumnDef<typeof features, T> = {
        id: column.id, header: column.header, accessorFn: column.value,
        enableSorting: column.sortable ?? false,
        enableColumnFilter: column.filterable ?? false,
        sortFn: column.type?.startsWith('number') ? 'basic' : 'alphanumeric',
        sortDescFirst: false,
        filterFn: 'includesString',
      };
      if (column.group) {
        let grouped = groups.get(column.group);
        if (!grouped) { grouped = []; groups.set(column.group, grouped); result.push({ id: `group:${column.group}`, header: column.group, columns: grouped }); }
        grouped.push(definition);
      } else result.push(definition);
    }
    return result;
  }, [columns, selection]);
  const table = useTable({
    features, columns: definitions, data: rows, getRowId,
    enableRowSelection: row => selection !== 'none' && !getRowDisabled?.(row.original),
    enableMultiRowSelection: selection === 'multiple',
    state: { rowSelection: selectedRows },
    onRowSelectionChange: updater => {
      const next = typeof updater === 'function' ? updater(selectedRows) : updater;
      setSelectedRows(next);
      onSelectionChange?.(rows.filter(row => next[getRowId(row)] && !getRowDisabled?.(row)).map(getRowId));
    },
  });
  const visibleRows = table.getRowModel().rows;
  const selectableRows = visibleRows.filter(row => row.getCanSelect());
  const selectedVisibleCount = selectableRows.filter(row => row.getIsSelected()).length;
  const effectiveActiveCell = visibleRows.some(row => !getRowDisabled?.(row.original) && row.getAllCells().some(cell => cell.id === activeCell))
    ? activeCell : visibleRows.find(row => !getRowDisabled?.(row.original))?.getAllCells()[0]?.id;
  const headers = table.getHeaderGroups();
  const leafColumns = table.getAllLeafColumns();
  const columnMap = new Map(columns.map(column => [column.id, column]));
  const selectedCount = rows.filter(row => selectedRows[getRowId(row)] && !getRowDisabled?.(row)).length;
  const openColumn = filterOpen ? table.getColumn(filterOpen) : undefined;
  const focusCell = (event: KeyboardEvent<HTMLTableCellElement>) => {
    if (event.target !== event.currentTarget || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const cell = event.currentTarget;
    const body = cell.closest('tbody');
    if (!body) return;
    const cells = Array.from(body.querySelectorAll<HTMLTableCellElement>('td[data-focusable="true"]'));
    const rowIndex = Number(cell.dataset.rowIndex);
    const columnIndex = cell.cellIndex;
    const targetRow = rowIndex + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0);
    const targetColumn = event.key === 'Home' ? 0 : event.key === 'End' ? leafColumns.length - 1 : columnIndex + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0);
    const target = cells.find(candidate => Number(candidate.dataset.rowIndex) === targetRow && candidate.cellIndex === targetColumn);
    if (target) { event.preventDefault(); target.focus(); }
  };
  return <div className={[styles.root, className].filter(Boolean).join(' ')} data-grid="">
    <div className={styles.summary}><span>{visibleRows.length} / {rows.length}개</span>{selection !== 'none' && <output aria-label="선택한 행 수">{selectedCount}개 선택</output>}</div>
    {openColumn && <div className={styles.filterBar}>
      <TextField autoFocus hideLabel size="small" label={`${columnMap.get(openColumn.id)?.header} 필터`} placeholder="포함할 값 입력" value={String(openColumn.getFilterValue() ?? '')} onChange={event => openColumn.setFilterValue(event.target.value)} />
      <GridIconButton aria-label="필터 지우기" icon="filter_alt_off" onClick={() => openColumn.setFilterValue('')} />
      <GridIconButton aria-label="필터 닫기" icon="close" onClick={() => { const target = document.getElementById(`${id}-filter-${openColumn.id}`); setFilterOpen(null); target?.focus(); }} />
    </div>}
    <div className={styles.scroller} tabIndex={0} role="region" aria-label={`${label} 스크롤 영역`}>
      <table className={styles.table} aria-label={label}>
        <colgroup>{leafColumns.map(column => <col key={column.id} style={{ width: column.id === '__selection' ? 40 : columnMap.get(column.id)?.width ?? (columnMap.get(column.id)?.type === 'no' ? 48 : 320) }} />)}</colgroup>
        <thead>{headers.map((group, groupIndex) => <tr key={group.id}>{group.headers.map(header => {
          const column = columnMap.get(header.column.id);
          const standalone = !column?.group && !header.column.columns.length;
          if (groupIndex > 0 && standalone) return null;
          const sorted = header.column.getIsSorted();
          return <th key={header.id} data-header-type={header.column.id === '__selection' ? 'choice' : column?.type === 'no' ? 'no' : 'normal'} colSpan={header.colSpan} rowSpan={standalone ? headers.length : undefined} scope={header.column.columns.length ? 'colgroup' : 'col'} aria-sort={header.column.getCanSort() ? sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none' : undefined}>
            <div className={styles.headerContent} data-centered={header.column.id === '__selection' || column?.type === 'no' || undefined}>
              {header.column.id === '__selection' ? selection === 'multiple' ? <GridChoice label="조회된 행 전체 선택" checked={selectableRows.length > 0 && selectedVisibleCount === selectableRows.length} mixed={selectedVisibleCount > 0 && selectedVisibleCount < selectableRows.length} disabled={!selectableRows.length} onChange={value => table.setRowSelection(previous => {
                const next = { ...previous };
                for (const row of selectableRows) { if (value) next[row.id] = true; else delete next[row.id]; }
                return next;
              })} /> : <span className={styles.radioPreview} role="img" aria-label="단일 행 선택 열" /> : <>
                {column?.required && <span className={styles.required} title="필수 입력">*</span>}
                <span className={styles.headerLabel}>{column?.header ?? String(header.column.columnDef.header)}</span>
                {header.column.columns.length > 0 && <>
                  <span className={styles.passiveIcon} title="그룹 정렬 · 동작 미정"><MaterialIcon name="arrow_upward" /></span>
                  <span className={styles.passiveIcon} title="그룹 필터 · 동작 미정"><MaterialIcon name="filter_list" /></span>
                </>}
                {header.column.getCanSort() && <GridIconButton aria-label={`${column?.header} 정렬`} icon={sorted === 'desc' ? 'arrow_downward' : 'arrow_upward'} onClick={() => header.column.toggleSorting()} data-active={Boolean(sorted)} />}
                {header.column.getCanFilter() && <GridIconButton id={`${id}-filter-${header.column.id}`} aria-label={`${column?.header} 필터 열기`} aria-expanded={filterOpen === header.column.id} icon="filter_list" data-active={Boolean(header.column.getFilterValue())} onClick={() => setFilterOpen(filterOpen === header.column.id ? null : header.column.id)} />}
              </>}
            </div>
          </th>;
        })}</tr>)}</thead>
        <tbody>{visibleRows.map((row, rowIndex) => {
          const disabled = Boolean(getRowDisabled?.(row.original));
          return <tr key={row.id} data-row-id={row.id} data-disabled={disabled || undefined} data-selected={!disabled && row.getIsSelected() || undefined}>
            {row.getAllCells().map((cell) => {
              const column = columnMap.get(cell.column.id);
              return <td key={cell.id} data-row-index={rowIndex} data-focusable={!disabled} data-cell-type={column ? column.type ?? 'text' : selection === 'single' ? 'radio-only' : 'check-only'} data-active={!disabled && activeCell === cell.id || undefined}
                tabIndex={disabled ? undefined : effectiveActiveCell === cell.id ? 0 : -1}
                onFocus={() => !disabled && setActiveCell(cell.id)} onClick={event => {
                  // React portal clicks bubble through the cell, but must retain Select's focus return.
                  if (!disabled && event.target instanceof Element && event.currentTarget.contains(event.target) && !event.target.closest('input, button, select, textarea, label, a, [role="combobox"]')) event.currentTarget.focus();
                }} onKeyDown={focusCell}>
                <div className={styles.cellContent}>
                  {cell.column.id === '__selection' ? <GridChoice label={`${row.id} 행 선택`} checked={!disabled && row.getIsSelected()} disabled={disabled} type={selection === 'single' ? 'radio' : 'checkbox'} name={`${id}-selection`} onChange={value => row.toggleSelected(value)} /> : column && <GridCell column={column} row={row.original} rowId={row.id} index={rowIndex} disabled={disabled} onChange={onCellChange} />}
                </div>
              </td>;
            })}
          </tr>;
        })}{!visibleRows.length && <tr><td colSpan={leafColumns.length} className={styles.empty}>{emptyMessage}</td></tr>}</tbody>
        {columns.some(column => column.footer) && <tfoot><tr>{leafColumns.map(leaf => {
          const column = columnMap.get(leaf.id);
          const value = column?.footer === 'sum' ? table.getFilteredRowModel().rows.reduce((sum, row) => { const number = Number(column.value(row.original)); return sum + (Number.isFinite(number) ? number : 0); }, 0).toLocaleString('ko-KR') : column?.footer?.label ?? '';
          return <td key={leaf.id} data-cell-type={column?.footer === 'sum' ? 'grand-total-number' : 'grand-total'}><div className={styles.cellContent}><span className={styles.text}>{value}</span></div></td>;
        })}</tr></tfoot>}
      </table>
    </div>
  </div>;
}

function GridCell<T>({ column, row, rowId, index, disabled, onChange }: { column: GridColumn<T>; row: T; rowId: string; index: number; disabled: boolean; onChange?: DataGridProps<T>['onCellChange'] }) {
  const value = column.value(row);
  const label = `${rowId} ${column.header}`;
  const text = String(value ?? '');
  const change = (next: string | number | boolean | null) => onChange?.(rowId, column.id, next);
  const passiveArrow = <MaterialIcon name="arrow_drop_down" className={styles.passiveIcon} />;
  let content: ReactNode;
  switch (column.type) {
    case 'no': content = <span className={styles.text}>{index + 1}</span>; break;
    case 'number': content = <span className={styles.text}>{typeof value === 'number' ? value.toLocaleString('ko-KR') : text}</span>; break;
    case 'text-edit': case 'number-edit': case 'text-edit-search': case 'number-edit-search':
      content = <><TextField className={styles.editor} label={label} hideLabel size="small" placeholder={column.placeholder} disabled={disabled} readOnly={!onChange} required={column.required} type={column.type.startsWith('number') ? 'number' : 'text'} value={text} onChange={event => change(column.type?.startsWith('number') ? event.target.value === '' ? null : Number(event.target.value) : event.target.value)} />{column.type.endsWith('-search') && (column.onSearch ? <GridIconButton aria-label={`${label} 검색`} icon="search" disabled={disabled} onClick={() => column.onSearch?.(row)} /> : <span className={styles.passiveIcon} title="검색 · 동작 미정"><MaterialIcon name="search" /></span>)}</>;
      break;
    case 'text-select':
      content = column.options && onChange ? <GridSelect label={label} value={text} options={column.options} disabled={disabled} onChange={change} /> : <><span className={styles.text}>{text}</span>{passiveArrow}</>;
      break;
    case 'chip':
      content = <div className={styles.chipContent}><span className={styles.chip}>{text}</span></div>;
      break;
    default: content = <span className={styles.text} title={text}>{text}</span>;
  }
  return content;
}
