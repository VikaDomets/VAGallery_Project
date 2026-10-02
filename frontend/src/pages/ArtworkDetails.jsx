import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/Catalog.css';

const categoryNames = { abstract: 'Абстракція', modern: 'Модерн / Сучасне мистецтво', renaissance: 'Ренесанс / Класика', portrait: 'Портрет', landscape: 'Пейзаж', graphics: 'Графіка', sculpture: 'Скульптура' };

export default function ArtworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useContext(CartContext);
  
  const [art, setArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  const purchased = JSON.parse(localStorage.getItem('my_collection')) || [];
  const soldItems = purchased.map(item => item.id);
  
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;

  // СТАН ДЛЯ ОБРАНОГО
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch(`https://vagallery-backend.onrender.com/api/artworks/${id}`)
      .then(res => res.json())
      .then(data => { setArt(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  // Функція додавання/видалення з Обраного
  const toggleWishlist = () => {
    let updatedWishlist;
    if (wishlist.includes(art.id)) {
      updatedWishlist = wishlist.filter(itemId => itemId !== art.id);
    } else {
      updatedWishlist = [...wishlist, art.id];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  // ПОПЕРЕДЖЕННЯ ДЛЯ ГОСТЕЙ (Попереджаємо перед тим як вигнати на логін)
  const handleGuestAction = (actionText) => {
    const isConfirmed = window.confirm(`Щоб ${actionText}, потрібно увійти у свій акаунт. Перейти на сторінку входу?`);
    if (isConfirmed) {
      navigate('/login');
    }
  };

  if (loading) return <main className="page-standard-padding"><div className="site-container"><h2>Завантаження...</h2></div></main>;
  if (!art) return <main className="page-standard-padding"><div className="site-container"><h2>Картину не знайдено</h2></div></main>;

  const isSold = art.status === 'sold' || soldItems.includes(art.id);
  const isMyWork = currentUser && currentUser.id === art.artist_id;
  const inCart = cartItems.find(item => item.id === art.id);

  return (
    <main className="page-standard-padding" style={{ paddingBottom: '100px' }}>
      <section className="site-container">
        
        {/* Крошки навігації */}
        <div style={{ marginBottom: '30px', fontSize: '0.9rem', color: '#94a3b8' }}>
            <Link to="/catalog" style={{ color: '#94a3b8', textDecoration: 'none' }}>Галерея</Link> 
            <span style={{ margin: '0 10px' }}>/</span> 
            <span>{categoryNames[art.category] || art.category}</span>
            <span style={{ margin: '0 10px' }}>/</span> 
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{art.title}</span>
        </div>

        {/* ГОЛОВНИЙ БЛОК: ФОТО + ІНФО */}
        <div className="artwork-hero-grid">
          
          {/* Ліва колонка: ФОТО БЕЗ ОБІДКА (Прямо як на референсі) */}
          <div style={{ width: '100%', maxHeight: '550px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
            <img 
              src={art.image_url} 
              alt={art.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSold ? 0.6 : 1, filter: isSold ? 'grayscale(1)' : 'none' }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800'; }}
            />
          </div>

          {/* Права колонка: Деталі */}
          <div className="artwork-info-col">
            <h1>{art.title}</h1>
            
            <div className="artwork-author-row">
              <img src={art.artist_avatar || `https://ui-avatars.com/api/?name=${art.artist_name}&background=cbd5e0&color=fff`} alt={art.artist_name} />
              <div>
                <Link to={`/artist/${art.artist_id}`} className="name">{art.artist_name}</Link>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--gray-text)', marginTop: '2px' }}>{art.artist_country || 'Україна'}</span>
              </div>
            </div>

            <div className="artwork-price-row">
              <span className="price">{Number(art.price) === 0 ? 'Безцінна' : `${art.price} ₴`}</span>
              {isSold ? (
                <span className="stock-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                  <i className="fa-solid fa-lock"></i> Продано
                </span>
              ) : Number(art.price) === 0 ? (
                <span className="stock-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                  Тільки портфоліо
                </span>
              ) : (
                <span className="stock-badge">
                  <i className="fa-solid fa-circle-check"></i> В наявності
                </span>
              )}
            </div>

            <ul className="artwork-specs">
              <li><i className="fa-regular fa-calendar"></i> 2024</li>
              <li><i className="fa-solid fa-expand"></i> {art.size ? `${art.size} см` : 'Розмір не вказано'}</li>
              <li><i className="fa-solid fa-palette"></i> {art.tech || 'Техніку не вказано'}</li>
              <li><i className="fa-solid fa-layer-group"></i> {categoryNames[art.category] || art.category}</li>
            </ul>

            <div className="artwork-buttons">
              {isSold ? (
                <button className="btn-buy-main" disabled>Роботу продано</button>
              ) : isMyWork ? (
                <button className="btn-buy-main" disabled style={{ background: '#f1f5f9', color: '#64748b' }}>Це ваша робота</button>
              ) : Number(art.price) === 0 ? (
                <button className="btn-buy-main" disabled style={{ background: '#f1f5f9', color: '#64748b' }}>Не для продажу</button>
              ) : inCart ? (
                <button className="btn-buy-main" style={{ background: '#10b981' }} disabled><i className="fa-solid fa-check"></i> У кошику</button>
              ) : (
                /* Перевірка для гостя при купівлі */
                <button 
                  className="btn-buy-main" 
                  onClick={() => currentUser ? addToCart(art) : handleGuestAction('придбати цю картину')}
                >
                  Купити роботу
                </button>
              )}
              
              {/* РОЗУМНА КНОПКА "ОБРАНЕ" (З попередженням для гостя) */}
              <button 
                className="btn-icon-secondary" 
                title="Додати в обране"
                onClick={() => currentUser ? toggleWishlist() : handleGuestAction('додати роботу в обране')}
                style={{ 
                  borderColor: wishlist.includes(art.id) ? '#e63946' : '#e2e8f0', 
                  color: wishlist.includes(art.id) ? '#e63946' : 'var(--text-main)' 
                }}
              >
                <i className={wishlist.includes(art.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
              </button>
            </div>
          </div>
        </div>

        {/* НИЖНІЙ БЛОК: ВКЛАДКИ З ТЕКСТОМ */}
        <div>
          <div className="artwork-tabs">
            <button className={`a-tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Опис</button>
            <button className={`a-tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Деталі</button>
            <button className={`a-tab-btn ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}>Доставка</button>
          </div>

          <div className="artwork-desc-text">
            {activeTab === 'description' && (
              <p>{art.description}</p>
            )}
            {activeTab === 'details' && (
              <p>Оригінальний твір мистецтва. Створений в єдиному екземплярі. Супроводжується сертифікатом автентичності від автора.</p>
            )}
            {activeTab === 'delivery' && (
              <p>Доставка здійснюється кур'єрською службою зі страхуванням вантажу. Картина пакується у спеціальний дерев'яний бокс для безпечного транспортування. Термін відправки — до 3 робочих днів.</p>
            )}
          </div>
        </div>

        {/* ІНШІ РОБОТИ АВТОРА */}
        {art.other_works && art.other_works.length > 0 && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '60px', marginTop: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-main)', margin: 0 }}>Інші роботи цього автора</h2>
              <Link to={`/artist/${art.artist_id}`} style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--text-main)' }}>Переглянути всі &rarr;</Link>
            </div>
            
            <div className="catalog-grid">
              {art.other_works.map(otherArt => (
                <div className="art-card" key={otherArt.id}>
                  <div className="art-img-wrapper" style={{ height: '300px' }}>
                    <Link to={`/artwork/${otherArt.id}`}>
                        <img src={otherArt.image_url} alt={otherArt.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800'; }} />
                    </Link>
                  </div>
                  <div className="art-info">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{otherArt.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{otherArt.price} ₴</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}