import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataGrid } from './DataGrid';

const meta = { title: 'Foundation/DataGrid', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Compact: Story = { render: () => <DataGrid label="Compact grid" getRowId={row => row.id} rows={[{ id: '1', name: 'Grid text', value: 1250 }, { id: '2', name: 'Another row', value: 750 }]} columns={[
  { id: 'name', header: 'Thead label', value: row => row.name, sortable: true, filterable: true, footer: { label: 'Grand total' } },
  { id: 'value', header: 'Number', type: 'number', value: row => row.value, sortable: true, footer: 'sum' },
]} /> };

export const WrappingAndSearch: Story = { render: () => <DataGrid label="Wrapping and search" selection="single" getRowId={row => row.id} rows={[{ id: '1', text: 'Grid text '.repeat(12).trim(), code: null }]} columns={[
  { id: 'text', header: 'Thead label '.repeat(8).trim(), value: row => row.text, sortable: true, filterable: true, required: true },
  { id: 'search', header: 'Text edit search', type: 'text-edit-search', value: row => row.text },
  { id: 'code', header: 'Number edit search', type: 'number-edit-search', value: row => row.code, placeholder: 'Label' },
]} /> };
