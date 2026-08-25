/** Application-facing UI entry point. */

export { MaterialIcon } from './icons/MaterialIcon';
export type { MaterialIconProps } from './icons/MaterialIcon';
export {
  DEFAULT_THEME_CONFIG,
  ThemeProvider,
  THEME_PRESETS,
  isValidSeedColor,
  useTheme,
} from './theme';
export type {
  ContrastMode,
  ThemeConfig,
  ThemeMode,
} from './theme';
export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant } from './components/Button';
export { IconButton } from './components/IconButton';
export type { IconButtonProps, IconButtonVariant } from './components/IconButton';
export { TextField } from './components/TextField';
export type { TextFieldProps, TextFieldVariant } from './components/TextField';
export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';
export { Select } from './components/Select';
export type { SelectOption, SelectProps } from './components/Select';
export { Dialog, DialogPrimitive } from './components/Dialog';
export type { DialogCloseReason, DialogProps } from './components/Dialog';
export { Menu } from './components/Menu';
export type { MenuItem, MenuProps } from './components/Menu';
export { SnackbarProvider, useSnackbar } from './components/Snackbar';
export type {
  SnackbarAction,
  SnackbarManager,
  SnackbarOptions,
  SnackbarProviderProps,
  SnackbarType,
} from './components/Snackbar';
