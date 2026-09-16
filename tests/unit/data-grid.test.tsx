import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataGrid } from '../../src/ui';

describe('DataGrid public contract', () => {
  it('reports stable IDs and excludes disabled rows from select all', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<DataGrid label="Orders" rows={[{ id: 'B', name: 'Beta', locked: false }, { id: 'A', name: 'Alpha', locked: true }]} getRowId={row => row.id} getRowDisabled={row => row.locked} onSelectionChange={change} columns={[{ id: 'name', header: 'Name', value: row => row.name, sortable: true }]} />);
    await user.click(screen.getByRole('button', { name: 'Name 정렬' }));
    await user.click(screen.getByRole('checkbox', { name: '조회된 행 전체 선택' }));
    expect(change).toHaveBeenLastCalledWith(['B']);
    expect(screen.getByRole('checkbox', { name: 'A 행 선택' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'B 행 선택' })).toBeChecked();
  });

  it('keeps chips static and search affordances passive without a lookup callback', () => {
    render(<DataGrid label="Preview" selection="none" rows={[{ id: '1', name: 'Submitted' }]} getRowId={row => row.id} columns={[
      { id: 'status', header: 'Status', type: 'chip', value: row => row.name },
      { id: 'search', header: 'Search', type: 'text-edit-search', value: () => '' },
    ]} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '1 Search 검색' })).not.toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeVisible();
  });

  it('routes a configured lookup through the consumer and blocks disabled rows', async () => {
    const search = vi.fn();
    const user = userEvent.setup();
    render(<DataGrid label="Lookup" selection="none" rows={[{ id: 'A', locked: false }, { id: 'B', locked: true }]} getRowId={row => row.id} getRowDisabled={row => row.locked} columns={[
      { id: 'code', header: 'Code', type: 'number-edit-search', value: () => 42, onSearch: search },
    ]} />);
    await user.click(screen.getByRole('button', { name: 'A Code 검색' }));
    expect(search).toHaveBeenCalledWith({ id: 'A', locked: false });
    expect(screen.getByRole('button', { name: 'B Code 검색' })).toBeDisabled();
  });
});
