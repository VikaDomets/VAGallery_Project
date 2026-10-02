import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/Catalog.css';

const categoryNames = { abstract: 'Абстракція', modern: 'Модерн / Сучасне мистецтво', renaissance: 'Ренесанс / Класика', portrait: 'Портрет', landscape: 'Пейзаж', graphics: 'Графіка', sculpture: 'Скульптура' };

export default function Catalog() {
  const { cartItems, addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Читаємо Wishlist поточного юзера!
  const [wishlist, setWishlist] = useState(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`wishlist_${currentUser.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [visibleCount, setVisibleCount] = useState(6);
  const [soldItems, setSoldItems] = useState([]);
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const purchasedKey = `my_collection_${currentUser.id}`;
      const purchased = JSON.parse(localStorage.getItem(purchasedKey)) || [];
      setSoldItems(purchased.map(item => item.id));
    }

    fetch('https://vagallery-backend.onrender.com/api/artworks/catalog')
      .then(res => res.json())
      .then(data => setArtworks(data))
      .catch(err => console.error('Помилка завантаження каталогу:', err));
  }, []);

  const toggleWishlist = (id) => {
    let updatedWishlist;
    const wishlistKey = `wishlist_${currentUser.id}`;
    if (wishlist.includes(id)) {
      updatedWishlist = wishlist.filter(itemId => itemId !== id);
    } else {
      updatedWishlist = [...wishlist, id];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
  };

  const handleGuestAction = (actionText) => {
    const isConfirmed = window.confirm(`Щоб ${actionText}, потрібно увійти у свій акаунт. Перейти на сторінку входу?`);
    if (isConfirmed) navigate('/login');
  };

  const safeArtworks = Array.isArray(artworks) ? artworks : [];

  const filteredArtworks = safeArtworks.filter((art) => {
    const matchCategory = activeFilter === 'all' || art.category === activeFilter;
    const artistName = art.artist_name || ''; 
    const matchSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        artistName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <main className="page-standard-padding">
      <section className="site-container pb-5">
        
        <div className="page-header-block">
          <h1 className="font-serif">Каталог робіт</h1>
          <p className="text-muted">Колекційні полотна від провідних українських митців. Доступні для миттєвого придбання.</p>
          
          <div className="exh-controls">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Пошук за назвою або автором..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>

            <div className={`filter-dropdown-wrapper ${activeFilter !== 'all' ? 'has-active' : ''}`} 
                 onMouseEnter={(e) => e.currentTarget.classList.add('open')}
                 onMouseLeave={(e) => e.currentTarget.classList.remove('open')}
            >
              <button className="btn-filter-toggle">
                <span>
                  <i className="fa-solid fa-filter" style={{ marginRight: '8px' }}></i> 
                  {activeFilter === 'all' ? 'Усі стилі' : categoryNames[activeFilter]}
                </span>
                <i className="fa-solid fa-chevron-down"></i>
              </button>

              <div className="filter-dropdown-menu">
                <div className={`filter-option ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                  <div className="filter-checkbox">{activeFilter === 'all' && <i className="fa-solid fa-check"></i>}</div>
                  <span>Всі роботи</span>
                </div>

                {Object.entries(categoryNames).map(([key, name]) => (
                  <div key={key} className={`filter-option ${activeFilter === key ? 'active' : ''}`} onClick={() => setActiveFilter(key)}>
                    <div className="filter-checkbox">{activeFilter === key && <i className="fa-solid fa-check"></i>}</div>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="catalog-grid mt-5">
          {filteredArtworks.slice(0, visibleCount).map((art) => {
            const isSold = art.status === 'sold' || soldItems.includes(art.id);
            const isPortfolioOnly = Number(art.price) === 0;

            return (
              <div className="art-card" key={art.id}>
                <div className="art-img-wrapper" style={{ opacity: isSold ? 0.6 : 1 }}>
                  <Link to={`/artwork/${art.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                    <img 
                      src={art.image_url} 
                      alt={art.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800'; }} 
                    />
                  </Link>
                  <span className="style-badge">{categoryNames[art.category] || art.category}</span>
                  <button 
                    className={`btn-wishlist ${wishlist.includes(art.id) ? 'active' : ''}`} 
                    onClick={() => currentUser ? toggleWishlist(art.id) : handleGuestAction('додати роботу в обране')}
                  >
                    <i className={wishlist.includes(art.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                  </button>
                </div>
                <div className="art-info">
                  <Link to={`/artwork/${art.id}`} style={{ textDecoration: 'none' }}>
                    <h2 className="font-serif" style={{ transition: '0.2s', cursor: 'pointer' }}>{art.title}</h2>
                  </Link>
                  <p className="art-author">автор: {art.artist_name}</p>
                  <div className="art-bottom-row">
                    <p className="art-price">{isPortfolioOnly ? 'Портфоліо' : `${art.price} ₴`}</p>
                    {isSold ? (
                      <span className="status-badge status-pending" style={{ padding: '8px 15px', background: '#e2e8f0', color: '#64748b', border: 'none' }}><i className="fa-solid fa-lock"></i> Продано</span>
                    ) : isPortfolioOnly ? (
                      <span className="status-badge" style={{ padding: '8px 15px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e0' }}>Не продається</span>
                    ) : currentUser && currentUser.id === art.artist_id ? (
                      <span className="status-badge" style={{ padding: '8px 15px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e0' }}><i className="fa-solid fa-user-pen"></i> Ваша робота</span>
                    ) : cartItems.find(item => item.id === art.id) ? (
                      <button className="btn-add-to-cart" style={{ background: '#10b981', cursor: 'default' }} disabled><i className="fa-solid fa-check"></i> У кошику</button>
                    ) : (
                      <button className="btn-add-to-cart" onClick={() => currentUser ? addToCart(art) : handleGuestAction('придбати цю картину')}><i className="fa-solid fa-cart-plus"></i> Додати</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4" style={{ paddingBottom: '60px' }}>
          {visibleCount < filteredArtworks.length ? (
            <button className="btn-load-more" onClick={() => setVisibleCount(visibleCount + 3)}>Показати більше</button>
          ) : filteredArtworks.length > 6 ? (
            <button className="btn-load-more" onClick={() => setVisibleCount(6)}>Показати менше</button>
          ) : null}
        </div>
        
        {filteredArtworks.length === 0 && (
          <div className="text-center pb-5 pt-4" style={{ color: 'var(--gray-text)' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', marginBottom: '15px' }}></i>
            <h3>Нічого не знайдено</h3>
            <p>У каталозі поки немає доступних робіт.</p>
          </div>
        )}
      </section>
    </main>
  );
}