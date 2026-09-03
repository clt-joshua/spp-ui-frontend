import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyInitialTheme, SnackbarProvider, ThemeProvider } from './ui';
import './ui/styles/layers.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Application root element was not found.');
}

applyInitialTheme();

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>,
);
