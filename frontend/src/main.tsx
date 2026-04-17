// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StoreContext, rootStore } from './store';
import App from './App';
import './assets/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StoreContext.Provider value={rootStore}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </StoreContext.Provider>,
);