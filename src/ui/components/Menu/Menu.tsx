import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ReactNode } from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { Button } from '../Button/Button';
import styles from './Menu.module.css';

export type MenuItem =
  | { type: 'item'; id: string; label: ReactNode; disabled?: boolean; onSelect(): void }
  | { type: 'checkbox'; id: string; label: ReactNode; checked: boolean; onCheckedChange(value: boolean): void }
  | { type: 'radio'; id: string; label: ReactNode; value: string; disabled?: boolean }
  | { type: 'submenu'; id: string; label: ReactNode; items: MenuItem[]; disabled?: boolean };

export interface MenuProps {
  items: MenuItem[];
  label: string;
  onRadioValueChange?: (value: string) => void;
  radioValue?: string;
  trigger?: ReactNode;
}

export function Menu({
  items,
  label,
  onRadioValueChange,
  radioValue,
  trigger,
}: MenuProps) {
  return (
    <BaseMenu.Root>
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
        <BaseMenu.Positioner align="start" className={styles.positioner} sideOffset={4}>
          <BaseMenu.Popup className={styles.popup}>
            <MenuItems
              items={items}
              onRadioValueChange={onRadioValueChange}
              radioValue={radioValue}
            />
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
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
            <BaseMenu.CheckboxItem
              checked={item.checked}
              className={styles.item}
              key={item.id}
              onCheckedChange={item.onCheckedChange}
            >
              <span>{item.label}</span>
              <BaseMenu.CheckboxItemIndicator className={styles.indicator}>
                <MaterialIcon name="check" />
              </BaseMenu.CheckboxItemIndicator>
            </BaseMenu.CheckboxItem>
          );
        }

        if (item.type === 'radio') {
          return (
            <BaseMenu.RadioGroup
              key={item.id}
              onValueChange={onRadioValueChange}
              value={radioValue}
            >
              <BaseMenu.RadioItem
                className={styles.item}
                disabled={item.disabled}
                value={item.value}
              >
                <span>{item.label}</span>
                <BaseMenu.RadioItemIndicator className={styles.indicator}>
                  <MaterialIcon name="check" />
                </BaseMenu.RadioItemIndicator>
              </BaseMenu.RadioItem>
            </BaseMenu.RadioGroup>
          );
        }

        if (item.type === 'submenu') {
          return (
            <BaseMenu.SubmenuRoot key={item.id}>
              <BaseMenu.SubmenuTrigger
                className={styles.item}
                disabled={item.disabled}
              >
                <span>{item.label}</span>
                <MaterialIcon name="chevron_right" />
              </BaseMenu.SubmenuTrigger>
              <BaseMenu.Portal>
                <BaseMenu.Positioner
                  align="start"
                  className={styles.positioner}
                  side="right"
                  sideOffset={-4}
                >
                  <BaseMenu.Popup className={styles.popup}>
                    <MenuItems
                      items={item.items}
                      onRadioValueChange={onRadioValueChange}
                      radioValue={radioValue}
                    />
                  </BaseMenu.Popup>
                </BaseMenu.Positioner>
              </BaseMenu.Portal>
            </BaseMenu.SubmenuRoot>
          );
        }

        return (
          <BaseMenu.Item
            className={styles.item}
            disabled={item.disabled}
            key={item.id}
            onClick={item.onSelect}
          >
            {item.label}
          </BaseMenu.Item>
        );
      })}
    </>
  );
}
