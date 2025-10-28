import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// ‼️ import carousel styles after core package styles
import '@mantine/carousel/styles.css';

const theme = createTheme({
  colors: {
    lavium: [
      '#ffe5e5', '#f8baba', '#f28f8f', '#eb6464', '#e53939',
      '#cc2020', '#a81717', '#900000', '#700000', '#500000'
    ],
  },
  primaryColor: 'lavium',
  defaultRadius: 'md',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
)
