import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// This entry point is for standalone development only.
// In production the shell loads this module via Module Federation.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
