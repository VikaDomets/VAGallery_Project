import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx'; // <--- ДОДАЛИ ІМПОРТ

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>  {/* <--- ОГОРНУЛИ APP */}
      <App />
    </CartProvider>
  </StrictMode>,
);