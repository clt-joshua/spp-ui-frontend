import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useFloatingLabelMotion } from '../../interactions/FloatingLabelMotion';
import { useMaterialMenuMotion } from '../../interactions/MenuMotion';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { FieldOutline } from '../FieldOutline/FieldOutline';
import { IconButton } from '../IconButton';
import field from '../FieldOutline/OutlinedField.module.css';
import menu from '../FieldOutline/FieldDropdown.module.css';
import styles from './AutoComplete.module.css';

export interface AutoCompleteOption {
  label: string;
  disabled?: boolean;
}

export interface AutoCompleteProps {
  label: string;
  options: readonly AutoCompleteOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  id?: string;
  form?: string;
  size?: 'large' | 'small';
  prefix?: ReactNode;
  suffix?: ReactNode;
  placeholder?: string;
  supportingText?: string;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  clearable?: boolean;
  emptyText?: string;
  className?: string;
  style?: CSSProperties;
}

/** Free text with optional suggestions; unlike Select, a suggestion is not required. */
export function AutoComplete({
  label, options, value, defaultValue = '', onValueChange, name, id, form,
  size = 'large', prefix, suffix, placeholder, supportingText, error, errorText,
  disabled, readOnly, required, clearable = true, emptyText = '일치하는 항목이 없습니다.', className, style,
}: AutoCompleteProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-support`;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [nativeError, setNativeError] = useState('');
  const invalid = Boolean(error || nativeError);
  const message = invalid ? errorText || nativeError || supportingText : supportingText;
  const floating = focused || open || currentValue.length > 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restingLabelRef = useRef<HTMLLabelElement>(null);
  const floatingLabelRef = useRef<HTMLSpanElement>(null);
  const { setItemElement, setPopupElement, setPositionerElement } = useMaterialMenuMotion<HTMLDivElement>(open);
  useFloatingLabelMotion({ durationProperty: '--md-text-field-motion-duration', easingProperty: '--md-text-field-motion-easing', floating, floatingLabelRef, restingLabelRef, rootRef });

  useEffect(() => {
    const owner = inputRef.current?.form;
    const reset = () => { setInternalValue(defaultValue); setNativeError(''); setOpen(false); };
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  }, [defaultValue, form]);

  return (
    <BaseAutocomplete.Root items={options} value={currentValue} name={name} form={form}
      disabled={disabled} readOnly={readOnly} required={required}
      open={open && !disabled && !readOnly} onOpenChange={setOpen}
      onValueChange={(next) => { setInternalValue(next); setNativeError(''); onValueChange?.(next); }}
      itemToStringValue={(option) => option.label}>
      <div ref={rootRef} className={[field.root, field.outlined, className].filter(Boolean).join(' ')} style={style}
        data-autocomplete="" data-size={size} data-floating={floating || undefined} data-populated={currentValue.length > 0 || undefined}
        data-disabled={disabled || undefined} data-readonly={readOnly || undefined} data-invalid={invalid || undefined}>
        <BaseAutocomplete.InputGroup className={field.control} data-slot="autocomplete-control"
          onClick={(event) => { if (!disabled && !(event.target as Element).closest('button')) inputRef.current?.focus(); }}>
          <FieldOutline className={field.outline} label={label} open={floating} />
          <label className={`${field.label} ${field.restingLabel}`} htmlFor={inputId} ref={restingLabelRef} data-slot="resting-label">{label}</label>
          <span aria-hidden="true" className={field.floatingLabelPosition}>
            <span className={`${field.label} ${field.floatingLabel}`} ref={floatingLabelRef} data-slot="floating-label">{label}</span>
          </span>
          {required ? <span aria-hidden="true" className={field.required}>*</span> : null}
          <div className={field.inputRow}>
            {prefix != null ? <span className={`${field.affix} ${field.prefix}`} data-slot="prefix">{prefix}</span> : null}
            <BaseAutocomplete.Input id={inputId} ref={inputRef} className={field.input} placeholder={placeholder ?? ' '}
              aria-invalid={invalid || undefined} aria-describedby={message ? messageId : undefined}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              onInvalid={(event) => setNativeError(event.currentTarget.validationMessage)} />
            {clearable && currentValue && !disabled && !readOnly ? (
              <BaseAutocomplete.Clear render={<IconButton aria-label={`${label} 지우기`} className={field.action} size={size} icon={<MaterialIcon name="highlight_off" />} />} />
            ) : null}
            {suffix != null ? <span className={`${field.affix} ${field.suffix}`} data-slot="suffix">{suffix}</span> : null}
          </div>
          <BaseAutocomplete.Trigger disabled={disabled || readOnly}
            render={<IconButton aria-label={`${label} 제안 목록`} className={field.action} size={size} icon={<MaterialIcon name="arrow_drop_down" />} />} />
        </BaseAutocomplete.InputGroup>
        {message ? <span className={invalid ? field.error : field.supporting} id={messageId}>{message}</span> : null}
      </div>
      <BaseAutocomplete.Portal>
        <BaseAutocomplete.Positioner align="start" data-slot="autocomplete-positioner"
          // Upward menus must not cover the portion of the floating label
          // above the field. Measure layout height, not its animated transform.
          sideOffset={({ side }) => side === 'top' ? (floatingLabelRef.current?.offsetHeight ?? 0) / 2 : 0}
          className={`${menu.positioner} ${styles.positioner}`} ref={setPositionerElement}>
          <BaseAutocomplete.Popup className={menu.popup} ref={setPopupElement}>
            <div className={menu.surface} data-slot="menu-surface">
              <div data-slot="menu-content">
                <BaseAutocomplete.Empty className={styles.empty}>{emptyText}</BaseAutocomplete.Empty>
                <BaseAutocomplete.List className={menu.list}>
                  {(option: AutoCompleteOption) => <Suggestion key={option.label} option={option} setItemElement={setItemElement} />}
                </BaseAutocomplete.List>
              </div>
            </div>
          </BaseAutocomplete.Popup>
        </BaseAutocomplete.Positioner>
      </BaseAutocomplete.Portal>
    </BaseAutocomplete.Root>
  );
}

function Suggestion({ option, setItemElement }: { option: AutoCompleteOption; setItemElement: (element: HTMLDivElement | null) => void }) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({ disabled: option.disabled });
  return (
    <BaseAutocomplete.Item value={option} disabled={option.disabled} className={`${menu.item} ${styles.item}`}
      ref={setItemElement} data-interactive-root="" data-pressed={pressed || undefined} {...interactionProps}>
      <StateLayer />{ripple}<FocusRing inward />
      <span className={menu.itemContent}>{option.label}</span>
    </BaseAutocomplete.Item>
  );
}
