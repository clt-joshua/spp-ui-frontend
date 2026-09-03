import { Menu as BaseMenu } from '@base-ui/react/menu';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import { useMaterialMenuMotion } from '../../interactions/MenuMotion';
import { Button } from '../Button/Button';
import styles from './Menu.module.css';

interface MenuItemBase {
  disabled?: boolean;
  id: string;
  label: ReactNode;
  leadingIcon?: ReactNode;
}

export type MenuItem =
  | (MenuItemBase & { type: 'item'; onSelect(): void })
  | (MenuItemBase & { type: 'checkbox'; checked: boolean; onCheckedChange(value: boolean): void })
  | (MenuItemBase & { type: 'radio'; value: string })
  | (MenuItemBase & { type: 'submenu'; items: MenuItem[] });

export interface MenuProps {
  className?: string;
  items: MenuItem[];
  label: string;
  onRadioValueChange?: (value: string) => void;
  radioValue?: string;
  style?: CSSProperties;
  trigger?: ReactNode;
}

export function Menu({
  className,
  items,
  label,
  onRadioValueChange,
  radioValue,
  style,
  trigger,
}: MenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <BaseMenu.Root onOpenChange={setOpen}>
      <BaseMenu.Trigger
        aria-label={label}
        render={(
          <Button
            trailingIcon={<MaterialIcon name="arrow_drop_down" />}
            variant="outlined"
          />
        )}
      >
        {trigger ?? label}
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <AnimatedMenuPopup
          align="start"
          className={className}
          open={open}
          sideOffset={4}
          style={style}
        >
          <MenuItems
            items={items}
            onRadioValueChange={onRadioValueChange}
            radioValue={radioValue}
          />
        </AnimatedMenuPopup>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

interface AnimatedMenuPopupProps {
  align: 'start';
  children: ReactNode;
  className?: string;
  open: boolean;
  side?: 'right';
  sideOffset: number;
  style?: CSSProperties;
}

function AnimatedMenuPopup({
  align,
  children,
  className,
  open,
  side,
  sideOffset,
  style,
}: AnimatedMenuPopupProps) {
  const {
    setPopupElement,
    setPositionerElement,
  } = useMaterialMenuMotion<HTMLDivElement>(open);

  return (
    <BaseMenu.Positioner
      align={align}
      className={styles.positioner}
      ref={setPositionerElement}
      side={side}
      sideOffset={sideOffset}
    >
      <BaseMenu.Popup
        className={[styles.popup, className].filter(Boolean).join(' ')}
        ref={setPopupElement}
        style={style}
      >
        <div className={styles.surface} data-slot="menu-surface">
          <div className={styles.list} data-slot="menu-content">{children}</div>
        </div>
      </BaseMenu.Popup>
    </BaseMenu.Positioner>
  );
}

interface MenuItemsProps {
  items: MenuItem[];
  onRadioValueChange?: (value: string) => void;
  radioValue?: string;
}

function MenuItems({ items, onRadioValueChange, radioValue }: MenuItemsProps) {
  return (
    <>
      {items.map((item) => {
        if (item.type === 'checkbox') {
          return (
            <MenuCheckboxItem item={item} key={item.id} />
          );
        }

        if (item.type === 'radio') {
          return (
            <BaseMenu.RadioGroup
              key={item.id}
              onValueChange={onRadioValueChange}
              value={radioValue}
            >
              <MenuRadioItem item={item} />
            </BaseMenu.RadioGroup>
          );
        }

        if (item.type === 'submenu') {
          return (
            <MenuSubmenu
              item={item}
              key={item.id}
              onRadioValueChange={onRadioValueChange}
              radioValue={radioValue}
            />
          );
        }

        return (
          <MenuActionItem item={item} key={item.id} />
        );
      })}
    </>
  );
}

function InteractionLayers({ ripple }: { ripple: ReactNode }) {
  return (
    <>
      <StateLayer />
      {ripple}
      <FocusRing inward />
    </>
  );
}

function MenuCheckboxItem({ item }: { item: Extract<MenuItem, { type: 'checkbox' }> }) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    disabled: item.disabled,
  });

  return (
    <BaseMenu.CheckboxItem
      checked={item.checked}
      className={styles.item}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      disabled={item.disabled}
      onBlur={interactionProps.onBlur}
      onCheckedChange={item.onCheckedChange}
      onKeyDown={interactionProps.onKeyDown}
      onKeyUp={interactionProps.onKeyUp}
      onPointerCancel={interactionProps.onPointerCancel}
      onPointerDown={interactionProps.onPointerDown}
      onPointerUp={interactionProps.onPointerUp}
    >
      <InteractionLayers ripple={ripple} />
      <span className={styles.itemContent}>
        <MenuItemLabel item={item} />
        <BaseMenu.CheckboxItemIndicator className={styles.indicator}>
          <MaterialIcon name="check" />
        </BaseMenu.CheckboxItemIndicator>
      </span>
    </BaseMenu.CheckboxItem>
  );
}

function MenuRadioItem({ item }: { item: Extract<MenuItem, { type: 'radio' }> }) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    disabled: item.disabled,
  });

  return (
    <BaseMenu.RadioItem
      className={styles.item}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      disabled={item.disabled}
      onBlur={interactionProps.onBlur}
      onKeyDown={interactionProps.onKeyDown}
      onKeyUp={interactionProps.onKeyUp}
      onPointerCancel={interactionProps.onPointerCancel}
      onPointerDown={interactionProps.onPointerDown}
      onPointerUp={interactionProps.onPointerUp}
      value={item.value}
    >
      <InteractionLayers ripple={ripple} />
      <span className={styles.itemContent}>
        <MenuItemLabel item={item} />
        <BaseMenu.RadioItemIndicator className={styles.indicator}>
          <MaterialIcon name="check" />
        </BaseMenu.RadioItemIndicator>
      </span>
    </BaseMenu.RadioItem>
  );
}

function MenuActionItem({ item }: { item: Extract<MenuItem, { type: 'item' }> }) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    disabled: item.disabled,
  });

  return (
    <BaseMenu.Item
      className={styles.item}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      disabled={item.disabled}
      onBlur={interactionProps.onBlur}
      onClick={item.onSelect}
      onKeyDown={interactionProps.onKeyDown}
      onKeyUp={interactionProps.onKeyUp}
      onPointerCancel={interactionProps.onPointerCancel}
      onPointerDown={interactionProps.onPointerDown}
      onPointerUp={interactionProps.onPointerUp}
    >
      <InteractionLayers ripple={ripple} />
      <span className={styles.itemContent}><MenuItemLabel item={item} /></span>
    </BaseMenu.Item>
  );
}

function MenuItemLabel({ item }: { item: MenuItem }) {
  return (
    <span className={styles.itemLabel}>
      {item.leadingIcon ? <span className={styles.leadingIcon}>{item.leadingIcon}</span> : null}
      <span>{item.label}</span>
    </span>
  );
}

interface MenuSubmenuProps {
  item: Extract<MenuItem, { type: 'submenu' }>;
  onRadioValueChange?: (value: string) => void;
  radioValue?: string;
}

function MenuSubmenu({ item, onRadioValueChange, radioValue }: MenuSubmenuProps) {
  const [open, setOpen] = useState(false);
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    disabled: item.disabled,
  });

  return (
    <BaseMenu.SubmenuRoot onOpenChange={setOpen}>
      <BaseMenu.SubmenuTrigger
        className={styles.item}
        data-interactive-root=""
        data-pressed={pressed || undefined}
        disabled={item.disabled}
        onBlur={interactionProps.onBlur}
        onKeyDown={interactionProps.onKeyDown}
        onKeyUp={interactionProps.onKeyUp}
        onPointerCancel={interactionProps.onPointerCancel}
        onPointerDown={interactionProps.onPointerDown}
        onPointerUp={interactionProps.onPointerUp}
      >
        <InteractionLayers ripple={ripple} />
        <span className={styles.itemContent}>
          <MenuItemLabel item={item} />
          <MaterialIcon name="chevron_right" />
        </span>
      </BaseMenu.SubmenuTrigger>
      <BaseMenu.Portal>
        <AnimatedMenuPopup
          align="start"
          open={open}
          side="right"
          sideOffset={-4}
        >
          <MenuItems
            items={item.items}
            onRadioValueChange={onRadioValueChange}
            radioValue={radioValue}
          />
        </AnimatedMenuPopup>
      </BaseMenu.Portal>
    </BaseMenu.SubmenuRoot>
  );
}
