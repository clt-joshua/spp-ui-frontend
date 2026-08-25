import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SnackbarProvider, ThemeProvider } from './ui';
import { bootstrapTheme } from './ui/theme/bootstrap-theme';
import './ui/styles/layers.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Application root element was not found.');
}

bootstrapTheme();

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>,
);
