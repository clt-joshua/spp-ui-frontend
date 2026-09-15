import { useState } from 'react';
import { Menu, MaterialIcon } from '@/ui';
import { SampleGroup } from './SampleGroup';

export function MenuGallery() {
  const [result, setResult] = useState('');
  const [menuChecked, setMenuChecked] = useState(true);
  const [menuDensity, setMenuDensity] = useState('comfortable');

  return (
    <>
      <SampleGroup title="Menu item types">
        <Menu
          items={[
            { type: 'item', id: 'new', label: '새 프로젝트', leadingIcon: <MaterialIcon name="add" />, onSelect: () => setResult('새 프로젝트 메뉴를 선택했습니다.') },
            { type: 'checkbox', id: 'visible', label: '미리보기 표시', checked: menuChecked, onCheckedChange: setMenuChecked },
            { type: 'radio', id: 'comfortable', label: '보통 밀도', value: 'comfortable' },
            { type: 'radio', id: 'compact', label: '조밀한 밀도', value: 'compact' },
            { type: 'submenu', id: 'more', label: '더보기', items: [
              { type: 'item', id: 'docs', label: '문서', onSelect: () => setResult('문서 메뉴를 선택했습니다.') },
              { type: 'item', id: 'disabled', label: '비활성 항목', disabled: true, onSelect: () => undefined },
            ] },
          ]}
          label="검증용 Menu"
          onRadioValueChange={setMenuDensity}
          radioValue={menuDensity}
          trigger="Menu 열기"
        />
        <p role="status">{result}</p>
      </SampleGroup>
    </>
  );
}
