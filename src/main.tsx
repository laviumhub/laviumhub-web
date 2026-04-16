import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';

const theme = createTheme({
  colors: {
    lavium: [
      '#ffe5e5', '#f8baba', '#f28f8f', '#eb6464', '#e53939',
      '#cc2020', '#a81717', '#900000', '#700000', '#500000'
    ],
  },
  primaryColor: 'lavium',
  defaultRadius: 'md',
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position='top-right' />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
