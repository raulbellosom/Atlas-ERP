import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { validateEnv } from './config/env.js';
import App from './App.jsx';
import './assets/index.css';

// Fail fast: valida variables de entorno antes de montar la app
validateEnv();

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
