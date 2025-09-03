import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { BasketProvider } from './context/BasketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <BasketProvider>
          <App />
        </BasketProvider>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);