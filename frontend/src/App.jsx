// Імпортуємо інструменти для маршрутизації
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './styles/index.css';
import Header from './components/Header';
import Footer from './components/Footer';

// Імпортуємо наші сторінки
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Artists from './pages/Artists';
import Account from './pages/Account';
import Exhibition from './pages/Exhibition';
import About from './pages/About';
import ArtistProfile from './pages/ArtistProfile';
import Cart from './pages/Cart';
import ExhibitionDetails from './pages/ExhibitionDetails';
import ScrollToTop from './components/ScrollToTop';
import ArtworkDetails from './pages/ArtworkDetails';


import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    // Огортаємо весь додаток у BrowserRouter
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      
      {/* Тут сторінки будуть миттєво змінювати одна одну */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/account" element={<Account />} />
        <Route path="/exhibition" element={<Exhibition />} />
        <Route path="/contact" element={<About />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/exhibition/:id" element={<ExhibitionDetails />} />
        <Route path="/artwork/:id" element={<ArtworkDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Якщо адреса невідома - показуємо помилку 404 */}
        <Route path="*" element={
          <main style={{ minHeight: '80vh', paddingTop: '150px', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--text-main)' }}>404 - Сторінку не знайдено</h1>
          </main>
        } />
      </Routes>

      <Footer />
      
    </BrowserRouter>
  );
}

export default App;