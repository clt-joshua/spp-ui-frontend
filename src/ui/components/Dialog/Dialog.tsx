import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import styles from './Dialog.module.css';

export type DialogCloseReason = 'trigger' | 'escape' | 'backdrop' | 'action';

export interface DialogProps {
  actions?: ReactNode;
  children?: ReactNode;
  defaultOpen?: boolean;
  description?: ReactNode;
  dismissible?: boolean;
  onOpenChange?: (open: boolean, reason: DialogCloseReason) => void;
  open?: boolean;
  title: ReactNode;
  trigger?: ReactNode;
  variant?: 'basic' | 'alert';
}

export function Dialog({
  actions,
  children,
  defaultOpen,
  description,
  dismissible = true,
  onOpenChange,
  open,
  title,
  trigger,
  variant = 'basic',
}: DialogProps) {
  return (
    <BaseDialog.Root
      defaultOpen={defaultOpen}
      disablePointerDismissal={!dismissible}
      onOpenChange={(nextOpen, details) => {
        if (!dismissible && details.reason === 'escape-key') {
          details.cancel();
          return;
        }
        const reason: DialogCloseReason = nextOpen
          ? 'trigger'
          : details.reason === 'escape-key'
            ? 'escape'
            : details.reason === 'outside-press'
              ? 'backdrop'
              : 'action';
        onOpenChange?.(nextOpen, reason);
      }}
      open={open}
    >
      {trigger ? (
        <BaseDialog.Trigger render={<Button variant="tonal" />}>
          {trigger}
        </BaseDialog.Trigger>
      ) : null}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Viewport className={styles.viewport}>
          <BaseDialog.Popup
            className={styles.popup}
            data-variant={variant}
            role={variant === 'alert' ? 'alertdialog' : 'dialog'}
          >
            <div className={styles.heading}>
              <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>
              {dismissible ? (
                <BaseDialog.Close
                  render={(
                    <IconButton
                      aria-label="대화상자 닫기"
                      icon={<MaterialIcon name="close" />}
                    />
                  )}
                />
              ) : null}
            </div>
            {description ? (
              <BaseDialog.Description className={styles.description}>
                {description}
              </BaseDialog.Description>
            ) : null}
            {children ? <div className={styles.content}>{children}</div> : null}
            {actions ? <div className={styles.actions}>{actions}</div> : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export { BaseDialog as DialogPrimitive };
