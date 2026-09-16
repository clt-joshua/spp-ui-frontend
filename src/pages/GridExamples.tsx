import { useState } from 'react';
import { DataGrid, type GridColumn } from '@/ui';

interface GridExampleRow { id: string; name: string; owner: string; category: string; status: string; quantity: number | null; amount: number; checked: boolean; disabled?: boolean }
const initialRows: GridExampleRow[] = [
  { id: 'REQ-001', name: '디자인 시스템 검토', owner: '김민서', category: '디자인', status: 'Submitted', quantity: 3, amount: 150000, checked: true },
  { id: 'REQ-002', name: '고객 목록 화면 개발', owner: '이서준', category: '개발', status: 'In progress', quantity: 5, amount: 320000, checked: false },
  { id: 'REQ-003', name: '운영 가이드 업데이트', owner: '박지우', category: '운영', status: 'Draft', quantity: 2, amount: 80000, checked: false },
  { id: 'REQ-004', name: '접근성 점검', owner: '최유진', category: '개발', status: 'Submitted', quantity: 4, amount: 210000, checked: true },
  { id: 'REQ-005', name: '지난 요청 · 편집 잠김', owner: '정도윤', category: '운영', status: 'Done', quantity: 1, amount: 45000, checked: true, disabled: true },
];
const columns: GridColumn<GridExampleRow>[] = [
  { id: 'no', header: 'No.', type: 'no', width: 48, value: row => row.id },
  { id: 'name', header: '업무명', width: 240, value: row => row.name, sortable: true, filterable: true, footer: { label: '조회 결과 총계' } },
  { id: 'owner', header: '담당자', type: 'text-edit', width: 180, value: row => row.owner, required: true, sortable: true, filterable: true },
  { id: 'category', header: '분류', type: 'text-select', width: 150, value: row => row.category, filterable: true, options: ['디자인', '개발', '운영'].map(value => ({ value, label: value })) },
  { id: 'status', header: '진행 상태', type: 'chip', width: 180, value: row => row.status, sortable: true, filterable: true },
  { id: 'quantity', header: '수량', group: '요청 상세', type: 'number-edit', width: 150, value: row => row.quantity, sortable: true, footer: 'sum' },
  { id: 'amount', header: '금액 (원)', group: '요청 상세', type: 'number', width: 180, value: row => row.amount, sortable: true, footer: 'sum' },
];
const getRowId = (row: GridExampleRow) => row.id;
const getRowDisabled = (row: GridExampleRow) => Boolean(row.disabled);

export function GridExamples({ matrix = false }: { matrix?: boolean }) {
  const [rows, setRows] = useState(initialRows);
  const change = (rowId: string, columnId: string, value: string | number | boolean | null) => {
    setRows(current => current.map(row => row.id === rowId && !row.disabled ? { ...row, [columnId]: value } : row));
  };
  return <>
    <DataGrid label="업무 요청 목록" rows={rows} columns={columns} getRowId={getRowId} getRowDisabled={getRowDisabled} onCellChange={change} />
    {matrix && <>
      <GridGuideExamples />
    </>}
  </>;
}

interface GuideRow { id: string; text: string; number: string; search: string; code: number | null; disabled?: boolean }
const guideRows: GuideRow[] = [
  { id: 'GUIDE-001', text: 'Grid text', number: '125,000', search: '', code: null },
  { id: 'GUIDE-002', text: 'Grid text '.repeat(12).trim(), number: 'Grid text '.repeat(12).trim(), search: '검색어를 입력하세요', code: 1200 },
  { id: 'GUIDE-003', text: 'Grid text', number: '125,000', search: '편집 잠김', code: 1200, disabled: true },
];
const guideColumns: GridColumn<GuideRow>[] = [
  { id: 'text', header: 'Thead label '.repeat(8).trim(), type: 'text', value: row => row.text, width: 320, sortable: true, filterable: true, required: true },
  { id: 'number', header: 'Number', type: 'number', value: row => row.number, width: 320 },
  { id: 'search', header: 'Text edit search', type: 'text-edit-search', value: row => row.search, width: 320, placeholder: 'Label' },
  { id: 'code', header: 'Number edit search', type: 'number-edit-search', value: row => row.code, width: 320, placeholder: 'Label' },
];

export function GridGuideExamples() {
  const [rows, setRows] = useState(guideRows);
  return <>
    <h3>줄바꿈 · 검색형 편집 · 단일 선택</h3>
    <p>내용이 길면 행 높이가 늘어납니다. 검색형 셀의 입력은 편집할 수 있으며 검색 아이콘은 기능 정의 전 시각 예시입니다.</p>
    <DataGrid label="그리드 시각 타입" rows={rows} selection="single" getRowId={row => row.id} getRowDisabled={row => Boolean(row.disabled)} columns={guideColumns}
      onCellChange={(id, column, value) => setRows(current => current.map(row => row.id === id && !row.disabled ? { ...row, [column]: value } : row))} />
  </>;
}
