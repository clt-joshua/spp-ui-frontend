import type { Preview } from '@storybook/react-vite';
import { SnackbarProvider, ThemeProvider } from '../src/ui';
import '../src/ui/styles/layers.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <SnackbarProvider><Story /></SnackbarProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
    a11y: { test: 'error' },
    controls: { expanded: true },
    layout: 'centered',
  },
};

export default preview;
