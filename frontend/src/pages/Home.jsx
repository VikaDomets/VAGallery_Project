  import { useState, useEffect } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import { Swiper, SwiperSlide } from 'swiper/react';
  import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

  import 'swiper/css';
  import 'swiper/css/pagination';
  import 'swiper/css/effect-fade';

  // Словник перекладу категорій
  const categoryNames = {
    abstract: 'Абстракція',
    modern: 'Модерн / Сучасне мистецтво',
    renaissance: 'Ренесанс / Класика',
    portrait: 'Портрет',
    landscape: 'Пейзаж',
    graphics: 'Графіка',
    sculpture: 'Скульптура'
  };

  export default function Home() {
    const navigate = useNavigate();
    const [latestArtworks, setLatestArtworks] = useState([]);

    // Завантажуємо останні схвалені картини при відкритті сторінки
    useEffect(() => {
      fetch('https://vagallery-backend.onrender.com/api/artworks/catalog')
        .then(res => res.json())
        .then(data => {
          // Беремо тільки перші 3 найновіші картини
          setLatestArtworks(data.slice(0, 3));
        })
        .catch(err => console.error('Помилка завантаження останніх картин:', err));
    }, []);

    return (
      <main>
        {/* СЕКЦІЯ 1: HERO (Слайдер) */}
        <section className="hero-slider" style={{ position: 'relative', height: '100vh', width: '100%' }}>
          
          <div className="hero-content" style={{ position: 'absolute', zIndex: 10, width: '100%', height: '100%' }}>
            <div className="site-container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <div className="hero-text-wrapper">
                <h1 className="hero-title">
                  Відкривай<br />
                  <span className="fw-light fst-italic text-white-50">нове</span> українське<br />
                  мистецтво
                </h1>
                <p className="hero-subtitle">
                  Платформа для молодих художників, інвесторів та колекціонерів. Підтримуй сучасне українське мистецтво та знаходь унікальні роботи.</p>
                <div className="hero-actions">
                  <Link to="/catalog" className="btn btn-light">
                    Переглянути роботи <i className="fa-solid fa-arrow-right-long ms-2"></i>
                  </Link>
                  <Link to="/register" className="btn btn-outline-light">
                    Стати художником
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            loop={true}
            speed={1500}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: '.custom-swiper-pagination',
            }}
            style={{ width: '100%', height: '100%' }}
          >
            <SwiperSlide>
              <div className="slide-overlay"></div>
              <img src="/img/1.jpg" alt="1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </SwiperSlide>
            <SwiperSlide>
              <div className="slide-overlay"></div>
              <img src="/img/2.jpg" alt="2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </SwiperSlide>
            <SwiperSlide>
              <div className="slide-overlay"></div>
              <img src="/img/3.jpg" alt="3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </SwiperSlide>

            <div className="custom-swiper-pagination"></div>
          </Swiper>
        </section>

        {/* СЕКЦІЯ 2: РОЛІ */}
        <section className="roles-section">
          <div className="site-container text-center">
            <span className="cta-label border-label mb-3">твій шлях</span>
            <h1 className="text-dark mb-5">Стань частиною екосистеми</h1>
            
            <div className="roles-grid">
              <div className="role-card artist">
                <div className="role-content">
                  <div className="role-icon"><i className="fa-solid fa-palette"></i></div>
                  <h1 className="text-dark" style={{ fontSize: '2.2rem', marginBottom: '20px' }}>Митець</h1>
                  <p>Твори історію. Презентуй свої роботи світові, керуй власним магазином та отримуй пряму підтримку без посередників.</p>
                  <ul className="role-list">
                    <li><i className="fa-solid fa-check"></i> Персональна галерея</li>
                    <li><i className="fa-solid fa-check"></i> Прямі продажі</li>
                  </ul>
                  <button className="btn-role" onClick={() => navigate('/register')}>Стати митцем</button>
                </div>
              </div>
    
              <div className="role-card investor highlight">
                <div className="role-content">
                  <div className="role-icon"><i className="fa-solid fa-chart-line"></i></div>
                  <h1 className="text-dark" style={{ fontSize: '2.2rem', marginBottom: '20px' }}>Інвестор</h1>
                  <p>Формуй майбутнє. Фінансуй перспективні проєкти, підтримуй молоді таланти та інвестуй у мистецтво як капітал.</p>
                  <ul className="role-list">
                    <li><i className="fa-solid fa-check"></i> Арт-портфель</li>
                    <li><i className="fa-solid fa-check"></i> Ранній доступ</li>
                  </ul>
                  <button className="btn-role dark" onClick={() => navigate('/register')}>Інвестувати</button>
                </div>
              </div>
    
              <div className="role-card collector">
                <div className="role-content">
                  <div className="role-icon"><i className="fa-solid fa-heart"></i></div>
                  <h1 className="text-dark" style={{ fontSize: '2.2rem', marginBottom: '20px' }}>Поціновувач</h1>
                  <p>Живи мистецтвом. Колекціонуй унікальні роботи, підтримуй улюблених авторів донатами та впливай на розвиток спільноти.</p>
                  <ul className="role-list">
                    <li><i className="fa-solid fa-check"></i> Система донатів</li>
                    <li><i className="fa-solid fa-check"></i> Ексклюзивні покази</li>
                  </ul>
                  <button className="btn-role" onClick={() => navigate('/register')}>Приєднатись</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* СЕКЦІЯ 3: КАРТИНИ НА ПРОДАЖ (ТЕПЕР ДИНАМІЧНА!) */}
        <section className="sale-artworks-section">
          <div className="site-container">
            <div className="sale-header">
              <div className="sale-title-block">
                <span className="cta-label text-white border-label-white">Арт-ринок</span>
                <h1 className="text-white">Картини на продаж</h1>
              </div>
              <div className="sale-desc">
                <p className="text-white opacity-75">Тут митці нашої платформи виставляють свої роботи. Ви можете підтримати українське мистецтво, придбавши унікальний оригінал.</p>
              </div>
            </div>

            <div className="sale-grid mt-5">
              {latestArtworks.length > 0 ? (
                latestArtworks.map(art => {
                  const isSold = art.status === 'sold';

                  return (
                    <Link to={`/artwork/${art.id}`} style={{ textDecoration: 'none' }} key={art.id}>
                      <div className="sale-card">
                        <div className="sale-img-wrapper" style={{ opacity: isSold ? 0.6 : 1 }}>
                          <img 
                            src={art.image_url} 
                            alt={art.title} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800'; }} 
                          />
                          <span className="tag-top">{categoryNames[art.category] || art.category}</span>
                          <div className="price-tag">{isSold ? 'Продано' : `${art.price} ₴`}</div>
                        </div>
                        <div className="sale-info">
                          <h1>{art.title}</h1>
                          <p>автор: {art.artist_name}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p style={{ color: 'white', opacity: 0.6, fontSize: '1.1rem', textAlign: 'center', gridColumn: 'span 3', padding: '50px 0' }}>
                  На платформі поки немає опублікованих робіт.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* СЕКЦІЯ 4: CTA */}
        <section className="join-community">
          <div className="cta-left">
            <img src="/img/1page.png" alt="Art" />
            <div className="site-container cta-container-absolute">
              <div className="cta-overlay-text">
                <span className="cta-label">приєднуйся сьогодні</span>
                <h1>Стань частиною<br />арт-спільноти</h1>
              </div>
            </div>
          </div>
          <div className="cta-right">
            <div className="site-container">
              <div className="cta-text-box">
                <h1>Розпочни свою<br />мистецьку подорож</h1>
                <p>Зареєструйся як художник, інвестор або колекціонер та отримай доступ до унікальних можливостей платформи VA Gallery.</p>
                <button className="btn-dark-cta" onClick={() => navigate('/register')}>
                  Створити акаунт <i className="fa-solid fa-arrow-right-long ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  