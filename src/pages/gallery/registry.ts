import { ButtonGallery } from './ButtonGallery';
import { IconButtonGallery } from './IconButtonGallery';
import { TabsGallery } from './TabsGallery';
import { SegmentedButtonGallery } from './SegmentedButtonGallery';
import { TextFieldGallery } from './TextFieldGallery';
import { SelectGallery } from './SelectGallery';
import { AutoCompleteGallery } from './AutoCompleteGallery';
import { CheckboxGallery } from './CheckboxGallery';
import { RadioGallery } from './RadioGallery';
import { SwitchGallery } from './SwitchGallery';
import { ChipGallery } from './ChipGallery';
import { DialogGallery } from './DialogGallery';
import { MenuGallery } from './MenuGallery';

export const galleryComponents = [
  { id: 'button', label: 'Button', description: 'Figma 360 variants · 크기, 스타일, content, error와 실제 interaction', Example: ButtonGallery },
  { id: 'icon-button', label: 'IconButton', description: 'Figma 75 variants · 크기, 스타일, action과 toggle', Example: IconButtonGallery },
  { id: 'tabs', label: 'Tabs', description: '탭 선택, 키보드 이동과 panel 연결', Example: TabsGallery },
  { id: 'segmented-button', label: 'SegmentedButton', description: '단일·다중 선택과 선택 아이콘 모션', Example: SegmentedButtonGallery },
  { id: 'text-field', label: 'TextField', description: '직접 입력, 속성 토글, validation과 outlined 상태', Example: TextFieldGallery },
  { id: 'select', label: 'Select', description: '목록 선택, dropdown, disabled option과 폼 제출', Example: SelectGallery },
  { id: 'autocomplete', label: 'AutoComplete', description: '입력 제안, 필터링, 선택과 자유 입력', Example: AutoCompleteGallery },
  { id: 'checkbox', label: 'Checkbox', description: '크기, mixed·error·disabled와 선택 상태', Example: CheckboxGallery },
  { id: 'radio', label: 'Radio', description: '크기별 단일 선택과 키보드 이동', Example: RadioGallery },
  { id: 'switch', label: 'Switch', description: 'small binary 선택과 disabled 상태', Example: SwitchGallery },
  { id: 'chip', label: 'Chip', description: 'Assistive · Filter · Input · Location', Example: ChipGallery },
  { id: 'dialog', label: 'Dialog', description: 'modal·alert, dismiss와 포커스 복귀', Example: DialogGallery },
  { id: 'menu', label: 'Menu', description: '항목 선택, checkbox·radio·서브메뉴', Example: MenuGallery },
] as const;

export type GalleryComponentId = typeof galleryComponents[number]['id'];

const legacyIds: Record<string, GalleryComponentId> = {
  actions: 'button', navigation: 'tabs', 'form-fields': 'text-field', inputs: 'text-field',
  'selection-controls': 'checkbox', chips: 'chip', dialogs: 'dialog', overlays: 'dialog',
  menus: 'menu',
};

export function resolveGalleryId(hash: string): GalleryComponentId {
  const id = hash.replace(/^#/, '');
  return galleryComponents.find((entry) => entry.id === id)?.id
    ?? (Object.hasOwn(legacyIds, id) ? legacyIds[id]! : 'button');
}
