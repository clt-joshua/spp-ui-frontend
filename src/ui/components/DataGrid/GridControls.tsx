import { Select as BaseSelect } from '@base-ui/react/select';
import { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import { useMaterialMenuMotion } from '../../interactions/MenuMotion';
import { useDropdownKeyboardNavigation } from '../../interactions/DropdownKeyboardNavigation';
import menu from '../FieldOutline/FieldDropdown.module.css';
import styles from './DataGrid.module.css';

/** Compact controls have their own 24px targets; adjacent grid cells never overlap. */
export function GridIconButton({ icon, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string }) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({ disabled: props.disabled });
  return <button {...interactionProps} {...props} type="button" className={styles.iconButton} data-interactive-root="" data-pressed={pressed || undefined}>
    <StateLayer />{ripple}<FocusRing inward animated={false} /><MaterialIcon name={icon} />
  </button>;
}

export function GridChoice({ label, checked, mixed, disabled, onChange, type = 'checkbox', name }: {
  label: string; checked: boolean; mixed?: boolean; disabled?: boolean;
  onChange: (checked: boolean) => void; type?: 'checkbox' | 'radio'; name?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { interactionProps, pressed, ripple } = usePressableInteraction({ disabled, centered: true });
  useEffect(() => { if (ref.current) ref.current.indeterminate = Boolean(mixed); }, [mixed]);
  return <label {...interactionProps} className={styles.choice} data-interactive-root="" data-disabled={disabled || undefined} data-pressed={pressed || undefined}>
    <input ref={ref} aria-label={label} type={type} name={name} checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} />
    <StateLayer />{ripple}<FocusRing inward animated={false} />
    <span aria-hidden="true" className={styles.choiceIcon} data-radio={type === 'radio' || undefined} data-checked={checked || mixed || undefined}>
      {type === 'radio' ? checked && <span /> : (checked || mixed) && <MaterialIcon name={mixed ? 'remove' : 'check'} />}
    </span>
  </label>;
}

export interface GridOption { value: string; label: string; disabled?: boolean }

export function GridSelect({ label, value, options, onChange, disabled }: {
  label: string; value: string; options: GridOption[]; onChange: (value: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const navigation = useDropdownKeyboardNavigation();
  const { setPositionerElement, setPopupElement, setItemElement } = useMaterialMenuMotion<HTMLDivElement>(open);
  const display = options.find(option => option.value === value)?.label ?? value;
  return <BaseSelect.Root items={options} value={value} onValueChange={next => { if (next !== null) onChange(next); }} disabled={disabled} onOpenChange={setOpen}>
    <BaseSelect.Trigger {...navigation.modalityProps} aria-label={label} className={styles.select} data-interactive-root="">
      <StateLayer /><FocusRing inward animated={false} />
      <span className={styles.text}>{display}</span><span className={styles.passiveIcon}><MaterialIcon name="arrow_drop_down" /></span>
    </BaseSelect.Trigger>
    <BaseSelect.Portal><BaseSelect.Positioner align="start" alignItemWithTrigger={false} className={menu.positioner} ref={setPositionerElement}>
      <BaseSelect.Popup className={menu.popup} ref={setPopupElement} data-keyboard-navigation={navigation.keyboardNavigation} {...navigation.modalityProps}>
        <div className={menu.surface} data-slot="menu-surface"><BaseSelect.List className={menu.list} data-slot="menu-content">
          {options.map((option) => <BaseSelect.Item key={option.value} value={option.value} disabled={option.disabled} className={menu.item} ref={setItemElement} data-interactive-root="">
            <StateLayer /><FocusRing inward animated={false} /><BaseSelect.ItemText>{option.label}</BaseSelect.ItemText><BaseSelect.ItemIndicator><MaterialIcon name="check" /></BaseSelect.ItemIndicator>
          </BaseSelect.Item>)}
        </BaseSelect.List></div>
      </BaseSelect.Popup>
    </BaseSelect.Positioner></BaseSelect.Portal>
  </BaseSelect.Root>;
}
