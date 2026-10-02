import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  // ПЕРЕВІРЯЄМО, ЧИ КОРИСТУВАЧ ЗАЛОГІНЕНИЙ
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Імітація кількості товарів у кошику (пізніше підключимо до реальної бази)
  const { cartItems } = useContext(CartContext);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClass = `main-header ${isScrolled || !isHomePage ? 'scrolled' : ''}`;

  return (
    <header className={headerClass} id="header">
      <div className="header-container">
        
        <div className="header-left">
          <Link to="/" className="logo-text text-decoration-none">
            <strong>VA</strong> Gallery
          </Link>
        </div>

        <div className="header-center">
          <ul className="nav mb-0">
            <li><Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Головна</Link></li>
            <li><Link to="/exhibition" className={`nav-link ${location.pathname === '/exhibition' ? 'active' : ''}`}>Виставки</Link></li>
            <li><Link to="/artists" className={`nav-link ${location.pathname === '/artists' ? 'active' : ''}`}>Художники</Link></li>
            <li><Link to="/catalog" className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}>Каталог</Link></li>
            <li><Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Про нас</Link></li>
          </ul>
        </div>

        <div className="header-right">
          
          {user ? (
            /* ================= ЯКЩО КОРИСТУВАЧ УВІЙШОВ ================= */
            <div className="header-icons">
              
              {/* Кошик */}
              <Link to="/cart" className="h-icon-btn">
                <i className="fa-solid fa-basket-shopping"></i> {/* Іконка кошика */}
                {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
              </Link>

              {/* Профіль (Якщо є фото - показуємо його, якщо ні - іконку) */}
              <Link to="/account" className="h-icon-btn">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-avatar-img" />
                ) : (
                  <i className="fa-solid fa-circle-user"></i>
                )}
              </Link>

            </div>
          ) : (
            /* ================= ЯКЩО НЕ УВІЙШОВ (ГОСТБ) ================= */
            <>
              <Link to="/login" className="btn login-btn">Увійти</Link>
              <Link to="/register" className="btn register-btn">Приєднатися</Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
}