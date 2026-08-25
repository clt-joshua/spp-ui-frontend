import { createContext, useContext } from 'react';
import type { SnackbarManager } from './Snackbar';

export const SnackbarContext = createContext<SnackbarManager | null>(null);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider.');
  }
  return context;
}
