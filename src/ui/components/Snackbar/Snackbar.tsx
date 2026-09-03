import { Toast as BaseToast, type ToastObject } from '@base-ui/react/toast';
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import { SnackbarContext } from './snackbar-context';
import styles from './Snackbar.module.css';

export type SnackbarType = 'message' | 'loading' | 'success' | 'error';

export interface SnackbarAction {
  label: string;
  onAction(): void;
}

export interface SnackbarOptions {
  action?: SnackbarAction;
  dismissLabel?: string;
  id?: string;
  message: ReactNode;
  timeout?: number;
  type?: SnackbarType;
}

interface SnackbarData {
  action?: SnackbarAction;
  dismissLabel?: string;
}

export interface SnackbarManager {
  dismiss(id: string): void;
  show(options: SnackbarOptions): string;
  update(id: string, options: Partial<SnackbarOptions>): void;
}

export interface SnackbarProviderProps {
  children: ReactNode;
  limit?: number;
  timeout?: number;
}

export function SnackbarProvider({
  children,
  limit = 3,
  timeout = 5000,
}: SnackbarProviderProps) {
  return (
    <BaseToast.Provider limit={limit} timeout={timeout}>
      <SnackbarBridge>{children}</SnackbarBridge>
    </BaseToast.Provider>
  );
}

function SnackbarBridge({ children }: { children: ReactNode }) {
  const manager = BaseToast.useToastManager<SnackbarData>();

  const show = useCallback(
    ({ action, dismissLabel, id, message, timeout, type = 'message' }: SnackbarOptions) =>
      manager.add({
        data: { action, dismissLabel },
        description: message,
        id,
        priority: type === 'error' ? 'high' : 'low',
        timeout: type === 'loading' ? 0 : timeout,
        type,
      }),
    [manager],
  );

  const update = useCallback(
    (id: string, options: Partial<SnackbarOptions>) => {
      const currentData = manager.toasts.find((toast) => toast.id === id)?.data;
      manager.update(id, {
        data:
          'action' in options || 'dismissLabel' in options
            ? {
                action: 'action' in options ? options.action : currentData?.action,
                dismissLabel: 'dismissLabel' in options
                  ? options.dismissLabel
                  : currentData?.dismissLabel,
              }
            : undefined,
        description: options.message,
        priority: options.type === 'error' ? 'high' : undefined,
        timeout: options.type === 'loading' ? 0 : options.timeout,
        type: options.type,
      });
    },
    [manager],
  );

  const value = useMemo<SnackbarManager>(
    () => ({ dismiss: (id) => manager.close(id), show, update }),
    [manager, show, update],
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className={styles.viewport}>
          {manager.toasts.map((toast) => <SnackbarToast key={toast.id} toast={toast} />)}
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </SnackbarContext.Provider>
  );
}

function SnackbarToast({ toast }: { toast: ToastObject<SnackbarData> }) {
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [multiline, setMultiline] = useState(false);

  useLayoutEffect(() => {
    const description = descriptionRef.current;
    if (!description) return undefined;

    const measure = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(description).lineHeight);
      setMultiline(Number.isFinite(lineHeight) && description.scrollHeight > lineHeight * 1.5);
    };
    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(description);
    return () => observer.disconnect();
  }, [toast.description, toast.updateKey]);

  return (
    <BaseToast.Root
      className={styles.root}
      data-multiline={multiline || undefined}
      swipeDirection={['right', 'down']}
      toast={toast}
    >
      <BaseToast.Content className={styles.content}>
        <BaseToast.Description className={styles.description} ref={descriptionRef} />
      </BaseToast.Content>
      {toast.data?.action ? <SnackbarActionButton action={toast.data.action} /> : null}
      {toast.data?.dismissLabel ? (
        <SnackbarCloseButton label={toast.data.dismissLabel} />
      ) : null}
    </BaseToast.Root>
  );
}

function SnackbarActionButton({ action }: { action: SnackbarAction }) {
  const { interactionProps, pressed, ripple } = usePressableInteraction();

  return (
    <BaseToast.Action
      className={styles.action}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      onBlur={interactionProps.onBlur}
      onClick={action.onAction}
      onKeyDown={interactionProps.onKeyDown}
      onKeyUp={interactionProps.onKeyUp}
      onPointerCancel={interactionProps.onPointerCancel}
      onPointerDown={interactionProps.onPointerDown}
      onPointerUp={interactionProps.onPointerUp}
    >
      <StateLayer />
      {ripple}
      <FocusRing />
      <span className={styles.controlContent}>{action.label}</span>
    </BaseToast.Action>
  );
}

function SnackbarCloseButton({ label }: { label: string }) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({ centered: true });

  return (
    <BaseToast.Close
      aria-label={label}
      className={styles.close}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      onBlur={interactionProps.onBlur}
      onKeyDown={interactionProps.onKeyDown}
      onKeyUp={interactionProps.onKeyUp}
      onPointerCancel={interactionProps.onPointerCancel}
      onPointerDown={interactionProps.onPointerDown}
      onPointerUp={interactionProps.onPointerUp}
    >
      <StateLayer />
      {ripple}
      <FocusRing />
      <span className={styles.controlContent}><MaterialIcon name="close" /></span>
    </BaseToast.Close>
  );
}
