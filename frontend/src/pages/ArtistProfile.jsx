import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import '../styles/Artists.css';
import '../styles/Catalog.css';
import '../styles/Exhibition.css';

const categoryNames = { abstract: 'Абстракція', modern: 'Модерн / Сучасне мистецтво', renaissance: 'Ренесанс / Класика', portrait: 'Портрет', landscape: 'Пейзаж', graphics: 'Графіка', sculpture: 'Скульптура' };

export default function ArtistProfile() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('works');
  
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isMyProfile = currentUser && currentUser.id === parseInt(id);

  // Стан для обраного (прив'язаний до ID)
  const [wishlist, setWishlist] = useState(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`wishlist_${currentUser.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/artists/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Художника не знайдено');
        return res.json();
      })
      .then(data => {
        setArtist(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const toggleWishlist = (artId) => {
    let updatedWishlist;
    const wishlistKey = `wishlist_${currentUser.id}`;
    if (wishlist.includes(artId)) {
      updatedWishlist = wishlist.filter(itemId => itemId !== artId);
    } else {
      updatedWishlist = [...wishlist, artId];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
  };

  const handleGuestAction = (actionText) => {
    const isConfirmed = window.confirm(`Щоб ${actionText}, потрібно увійти у свій акаунт. Перейти на сторінку входу?`);
    if (isConfirmed) navigate('/login');
  };

  if (loading) return <main className="profile-page-wrapper"><div className="site-container"><h2>Завантаження...</h2></div></main>;
  if (!artist) return (
    <main className="profile-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state-box" style={{ background: '#fff', maxWidth: '500px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '50px 30px' }}>
        <i className="fa-solid fa-user-slash" style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '20px' }}></i>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '10px' }}>Художника не знайдено</h2>
        <button className="btn-dash-primary" onClick={() => navigate('/artists')} style={{ padding: '10px 24px', fontSize: '0.9rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', gap: '8px' }}>
          <i className="fa-solid fa-arrow-left"></i> Повернутися до списку
        </button>
      </div>
    </main>
  );
  
  const displayCity = artist.city || 'Україна';
  const displayCountry = artist.country ? `, ${artist.country}` : '';

  // МАГІЯ ІНВЕСТИЦІЙ: Шукаємо у цього художника активну краудфандингову виставку
  const activeExh = artist.exhibitions?.find(e => Number(e.funding_goal) > 0);
  
  // Рахуємо реальний прогрес цієї виставки
  let currentFunding = 0;
  let progress = 0;
  let goalLimit = 0;
  if (activeExh) {
      const savedFunding = localStorage.getItem(`exh_funding_${activeExh.id}`);
      currentFunding = savedFunding ? Number(savedFunding) : Number(activeExh.current_funding);
      goalLimit = Number(activeExh.funding_goal);
      progress = goalLimit > 0 ? Math.round((currentFunding / goalLimit) * 100) : 0;
  }

// Розумне "сідування" інвесторів (якщо база порожня, показуємо реалістичних меценатів під суму 5 690 ₴)
const getRealInvestors = () => {
  const investorsKey = `exh_investors_${activeExh.id}`;
  const saved = localStorage.getItem(investorsKey);
  if (saved) return JSON.parse(saved);

  // Стартові інвестори, які покривають початковий збір виставки
  const defaultInvestors = [
    { name: 'Марк Волков', amount: 3500, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200' },
    { name: 'Анна Світла', amount: 2190, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200' }
  ];
  localStorage.setItem(investorsKey, JSON.stringify(defaultInvestors));
  return defaultInvestors;
};

// Витягуємо реальних інвесторів, які прийшли з бази даних через бекенд!
const realInvestors = artist.investors || [];

const calculateAge = (birthdayStr) => {
  if (!birthdayStr) return "";
  const parts = birthdayStr.split('.');
  if (parts.length !== 3) return ""; 
  const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// Формуємо рядок з віком
const displayAge = artist.birthday ? ` • ${calculateAge(artist.birthday)} роки` : "";

  return (
    <main className="profile-page-wrapper">
      
      <div className="profile-banner">
        <img src={artist.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000"} alt="Cover" />
        <div className="profile-banner-overlay"></div>
      </div>

      <div className="profile-content-container">
        
        <div className="profile-header-main">
          <div className="profile-avatar-circle">
            <img src={artist.avatar_url || `https://ui-avatars.com/api/?name=${artist.name}&background=cbd5e0&color=fff&size=500`} alt={artist.name} />
          </div>
          <div className="profile-main-info">
            <div className="profile-name-block">
              <h1>{artist.name} <i className="fa-solid fa-circle-check verified-badge"></i></h1>
              <span className="profile-location"><i className="fa-solid fa-location-dot"></i> {displayCity}{displayCountry}{displayAge}</span>
            </div>
            <div className="profile-stats-block">
              <div className="stat-item"><strong>{artist.artworks ? artist.artworks.length : 0}</strong><span>Робіт</span></div>
              <div className="stat-item"><strong>{artist.exhibitions ? artist.exhibitions.length : 0}</strong><span>Виставок</span></div>
              <div className="stat-item"><strong>12</strong><span>Підписників</span></div>
            </div>
            {isMyProfile ? (
              <button className="btn-subscribe-profile" onClick={() => navigate('/account')} style={{ background: '#f1f5f9', borderColor: '#cbd5e0' }}><i className="fa-solid fa-pen"></i> Редагувати профіль</button>
            ) : (
              <button className="btn-subscribe-profile">Підписатися</button>
            )}
          </div>
        </div>

        <div className="profile-tabs-nav">
          <button className={`p-tab-btn ${activeTab === 'works' ? 'active' : ''}`} onClick={() => setActiveTab('works')}>Роботи</button>
          <button className={`p-tab-btn ${activeTab === 'exhibitions' ? 'active' : ''}`} onClick={() => setActiveTab('exhibitions')}>Виставки</button>
          <button className={`p-tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>Про себе</button>
          <button className={`p-tab-btn ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>Підтримка</button>
        </div>

        <div className="p-tab-content">
          {/* РОБОТИ */}
          {activeTab === 'works' && (
            <div className="catalog-grid mt-4">
              {artist.artworks && artist.artworks.length > 0 ? (
                artist.artworks.map(art => (
                  <div className="art-card" key={art.id}>
                    <div className="art-img-wrapper" style={{ opacity: art.status === 'sold' ? 0.6 : 1, background: '#e2e8f0' }}>
                      <Link to={`/artwork/${art.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                        <img src={art.image_url} alt={art.title} onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }} />
                      </Link>
                      <span className="style-badge">{categoryNames[art.category] || art.category}</span>
                      <button className={`btn-wishlist ${wishlist.includes(art.id) ? 'active' : ''}`} onClick={() => currentUser ? toggleWishlist(art.id) : handleGuestAction('додати роботу в обране')}>
                        <i className={wishlist.includes(art.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                      </button>
                    </div>
                    <div className="art-info">
                      <Link to={`/artwork/${art.id}`} style={{ textDecoration: 'none' }}>
                        <h2 className="font-serif" style={{ transition: '0.2s', cursor: 'pointer' }}>{art.title}</h2>
                      </Link>
                      <div className="art-bottom-row" style={{ marginTop: 'auto', paddingTop: '15px' }}>
                        <p className="art-price">{art.price} ₴</p>
                        {art.status === 'sold' ? (
                           <span className="status-badge status-pending" style={{ padding: '8px 15px', background: '#e2e8f0', color: '#64748b', border: 'none' }}><i className="fa-solid fa-lock"></i> Продано</span>
                        ) : (
                           <button className="btn-add-to-cart"><i className="fa-solid fa-cart-plus"></i> Додати</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Художник поки не опублікував жодної роботи.</p>
              )}
            </div>
          )}

          {/* ВИСТАВКИ */}
          {activeTab === 'exhibitions' && (
            <div className="exh-grid mt-4">
              {artist.exhibitions && artist.exhibitions.length > 0 ? (
                artist.exhibitions.map(exh => {
                  let progress = 0;
                  if (exh.funding_goal > 0) {
                      progress = Math.round((exh.current_funding / exh.funding_goal) * 100);
                  }
                  return (
                    <div className="exh-card" key={exh.id}>
                      <div className="exh-card-img">
                        <img src={exh.image_url} alt={exh.title} />
                        {exh.funding_goal > 0 && (
                          <div className="funding-overlay">
                            <div className="progress-container"><div className="progress-bar" style={{ width: `${progress}%` }}></div></div>
                            <span>Зібрано {progress}%</span>
                          </div>
                        )}
                      </div>
                      <div className="exh-card-info">
                        <span className="exh-date-label">{exh.date_range}</span>
                        <h2>{exh.title}</h2>
                        <p className="exh-location"><i className="fa-solid fa-location-dot"></i> {exh.location}</p>
                        <Link to={`/exhibition/${exh.id}`} className="btn-invest" style={{textDecoration:'none'}}>Переглянути</Link>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Немає активних виставок.</p>
              )}
            </div>
          )}

          {/* ПРО СЕБЕ */}
          {activeTab === 'about' && (
            <div className="p-about-text mt-4">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '20px' }}>Біографія</h3>
              <p style={{ color: '#1e293b', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{artist.bio || 'Художник ще не додав інформацію про себе.'}</p>
              {artist.skills && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '15px' }}>Напрямки роботи</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {artist.skills.split(',').map((skill, i) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#64748b', padding: '8px 15px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600' }}>{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ПІДТРИМКА / ІНВЕСТИЦІЇ (РЕАЛЬНІ ДАНІ!) */}
          {activeTab === 'support' && (
            <div className="invest-dashboard">
              {activeExh ? (
                <div className="inv-row-2">
                  
                  {/* Блок 1: Прогрес збору */}
                  <div className="inv-card">
                    <div className="inv-card-header">
                      <h3>Підтримка виставки «{activeExh.title}»</h3>
                    </div>
                    <div className="circle-progress-wrapper">
                      <div className="circle-progress" style={{ background: `conic-gradient(var(--text-main) ${progress}%, #f1f5f9 0)` }}>
                        <div className="circle-inner">
                          <h2>{progress}%</h2>
                          <span>зібрано</span>
                        </div>
                      </div>
                      <div className="inv-stats">
                        <h2>{currentFunding.toLocaleString('uk-UA')} ₴</h2>
                        <p>з {goalLimit.toLocaleString('uk-UA')} ₴</p>
                        <span style={{display:'block', marginBottom:'20px', color:'#64748b'}}>Ціль на реалізацію виставки</span>
                        <div style={{display:'flex', gap:'10px'}}>
                          <button className="btn-dash-primary" onClick={() => navigate(`/exhibition/${activeExh.id}`)} style={{flexGrow:1}}>Підтримати проєкт</button>
                        </div>
                      </div>
                    </div>
                  </div>

{/* БЛОК 2: Інвестори (РЕАЛЬНІ ДАНІ З БД!) */}
<div className="inv-card">
                  <div className="inv-card-header">
                    <h3>Інвестори цього митця</h3>
                  </div>
                  
                  <div className="inv-list">
                    {realInvestors.length > 0 ? (
                      realInvestors.map((inv, index) => {
                        // Перекладаємо роль на українську для бейджа
                        let roleUkr = 'Користувач';
                        if (inv.investor_role === 'collector') roleUkr = 'Поціновувач';
                        if (inv.investor_role === 'investor') roleUkr = 'Інвестор';
                        if (inv.investor_role === 'artist') roleUkr = 'Митець';

                        return (
                          <div className="inv-list-item" key={index}>
                            <div className="inv-list-user">
                              <img src={inv.investor_avatar || `https://ui-avatars.com/api/?name=${inv.investor_name}&background=cbd5e0&color=fff`} alt="U" />
                              <div>
                                <strong>{inv.investor_name}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                  {roleUkr} • підтримав «{inv.exhibition_title}»
                                </span>
                              </div>
                            </div>
                            <div className="inv-list-amount">{Number(inv.amount).toLocaleString('uk-UA')} ₴</div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: '#94a3b8', padding: '20px 0' }}>Для цього митця ще немає активних інвестицій.</p>
                    )}
                  </div>
                </div>

                </div>
              ) : (
                <div className="empty-state-box" style={{ background: '#ffffff', borderColor: '#e2e8f0', marginTop: '20px' }}>
                  <i className="fa-solid fa-hand-holding-dollar" style={{ color: '#cbd5e0' }}></i>
                  <h3>Немає активних проєктів для збору коштів</h3>
                  <p>Художник поки не планує краудфандингових виставок.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}