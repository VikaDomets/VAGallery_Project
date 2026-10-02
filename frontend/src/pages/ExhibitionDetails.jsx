import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import '../styles/Exhibition.css';
import '../styles/Catalog.css'; 

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

export default function ExhibitionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exh, setExh] = useState(null);
  const [loading, setLoading] = useState(true);

  // Стан для суми підтримки
  const [investAmount, setInvestAmount] = useState('');
  const [currentFunding, setCurrentFunding] = useState(0);

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;

  // Стан для коментарів (Додано фото!)
  const [comments, setComments] = useState([
    { id: 1, name: 'Марк Волков', role: 'Інвестор', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200', text: 'Дуже сильний концепт! Вірю в успіх цієї виставки.' },
    { id: 2, name: 'Анна Світла', role: 'Поціновувач', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200', text: 'Чекаю з нетерпінням відкриття!' }
  ]);

  useEffect(() => {
    fetch(`https://vagallery-backend.onrender.com/api/exhibitions/${id}`)
      .then(res => res.json())
      .then(data => { 
        setExh(data); 
        const savedFunding = localStorage.getItem(`exh_funding_${data.id}`);
        setCurrentFunding(savedFunding ? Number(savedFunding) : Number(data.current_funding));
        setLoading(false); 
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  // ФУНКЦІЯ КУПІВЛІ КВИТКА (ЗБЕРІГАЄТЬСЯ В КАБІНЕТ!)
  const handleBuyTicket = () => {
    if (!currentUser) {
      const isConfirmed = window.confirm(`Щоб придбати квиток, потрібно увійти в акаунт. Перейти на сторінку входу?`);
      if (isConfirmed) navigate('/login');
      return;
    }

    const bookedKey = `booked_exhibitions_${currentUser.id}`;
    const existing = JSON.parse(localStorage.getItem(bookedKey)) || [];

    if (existing.find(item => item.id === exh.id)) {
      alert('Ви вже придбали квиток на цю виставку!');
      return;
    }

    localStorage.setItem(bookedKey, JSON.stringify([...existing, exh]));
    alert(`Квиток на виставку "${exh.title}" успішно придбано!`);
  };

  // ФУНКЦІЯ СУПЕР-ІНВЕСТИЦІЇ (ЗВ'ЯЗУЄМО З БАЗОЮ ТА КАБІНЕТОМ!)
  const handleInvest = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert('Увійдіть в акаунт, щоб зробити внесок.');
    
    const amount = Number(investAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
        return alert('Введіть коректну суму!');
    }

    try {
      const response = await fetch('https://vagallery-backend.onrender.com/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          exhibition_id: exh.id,
          amount: amount
        })
      });

      if (response.ok) {
        const newFunding = currentFunding + amount;
        setCurrentFunding(newFunding);
        localStorage.setItem(`exh_funding_${exh.id}`, newFunding);
        
        const investKey = `my_investments_${currentUser.id}`;
        const existingInvestments = JSON.parse(localStorage.getItem(investKey)) || [];
        existingInvestments.push({
          exhId: exh.id,
          title: exh.title,
          amount: amount,
          date: new Date().toLocaleDateString('uk-UA'),
          img: exh.image_url
        });
        localStorage.setItem(investKey, JSON.stringify(existingInvestments));

        const exhInvestorsKey = `exh_investors_${exh.id}`;
        const exhInvestors = JSON.parse(localStorage.getItem(exhInvestorsKey)) || [];
        exhInvestors.push({
            name: currentUser.name,
            amount: amount,
            avatar: currentUser.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.name}&background=cbd5e0&color=fff`
        });
        localStorage.setItem(exhInvestorsKey, JSON.stringify(exhInvestors));

        alert(`Дякуємо! Ви успішно підтримали проєкт на суму ${amount.toLocaleString('uk-UA')} ₴`);
        setInvestAmount('');
      } else {
        alert('Помилка при проведенні інвестиції');
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з\'єднання з сервером');
    }
  };

  // КОМЕНТАРІ (Підтягують твій аватар!)
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!currentUser) {
        alert('Щоб залишити коментар, потрібно увійти в акаунт!');
        return;
    }

    const text = e.target.comment.value;
    let roleName = 'Користувач';
    if (currentUser.role === 'artist') roleName = 'Митець';
    if (currentUser.role === 'investor') roleName = 'Інвестор';
    if (currentUser.role === 'collector') roleName = 'Поціновувач';

    const newComment = { 
        id: Date.now(), 
        name: currentUser.name, 
        role: roleName, 
        avatar: currentUser.avatar_url, // Твоє реальне фото профілю
        text 
    };
    
    setComments([newComment, ...comments]);
    e.target.reset();
  };

  if (loading) return <main className="exh-detail-page"><div className="site-container"><h2>Завантаження...</h2></div></main>;
  if (!exh) return <main className="exh-detail-page"><div className="site-container"><h2>Виставку не знайдено</h2></div></main>;

  const goalLimit = exh.funding_goal > 0 ? Number(exh.funding_goal) : 0;
  const progress = goalLimit > 0 ? Math.round((currentFunding / goalLimit) * 100) : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <main className="exh-detail-page">
      <div className="site-container">
        
        {/* Кнопка Назад */}
        <button className="btn-back" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: '10px' }}></i> До списку виставок
        </button>

        {/* 1. ВЕРХНІЙ БЛОК: ТЕКСТ ЗЛІВА, ФОТО СПРАВА */}
        <div className="exh-hero-grid">
          <div className="exh-hero-text">
            {goalLimit > 0 && <span className="status-badge status-pending" style={{marginBottom:'15px', display:'inline-block'}}>Майбутня виставка</span>}
            
            <h1>{exh.title}</h1>
            <p className="exh-hero-desc">
            {exh.artist_name}: персональна виставка, де досліджуються нові грані сучасного українського мистецтва.
            </p>

            <div className="exh-hero-meta">
            <div className="meta-item">
              <i className="fa-regular fa-calendar"></i> {formatDate(exh.start_date)} — {formatDate(exh.end_date)}
            </div>
              <div className="meta-item"><i className="fa-solid fa-location-dot"></i> {exh.location}</div>
              <div className="meta-item"><i className="fa-regular fa-clock"></i> 10:00 — 20:00 (Щодня)</div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-dash-primary" onClick={handleBuyTicket} style={{ padding: '15px 30px', borderRadius:'12px' }}>Купити квиток</button>
            </div>
          </div>

          <div className="exh-hero-image">
            <img src={exh.image_url} alt="Головне фото" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200'; }} />
          </div>
        </div>

        {/* 2. СЕРЕДНІЙ БЛОК: ОПИС, КОМЕНТАРІ І АВТОР */}
        <div className="exh-content-grid">
          
          <div className="exh-about-section">
            <h2>Про виставку</h2>
            <p>{exh.description}</p>

            {/* КОМЕНТАРІ */}
            <div className="comments-section">
              <h3>Обговорення ({comments.length})</h3>
              
              {currentUser ? (
                  <form onSubmit={handleAddComment} style={{ marginBottom: '40px' }}>
                    <textarea name="comment" rows="3" placeholder="Поділіться враженнями або залиште побажання митцю..." required></textarea>
                    <button type="submit" className="btn-dash-primary" style={{ padding: '10px 30px' }}>Надіслати</button>
                  </form>
              ) : (
                  <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px', textAlign: 'center', marginBottom: '40px', border: '1px solid #e2e8f0' }}>
                      <p style={{ color: 'var(--gray-text)', marginBottom: '10px' }}>Тільки зареєстровані користувачі можуть залишати коментарі.</p>
                      <Link to="/login" className="btn-dash-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Увійти в акаунт</Link>
                  </div>
              )}

              {comments.map(c => (
                <div className="comment-card" key={c.id}>
                  {/* Аватарка (Фото або перша літера) */}
                  <div className="comment-avatar">
                    {c.avatar ? (
                      <img src={c.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      c.name.charAt(0)
                    )}
                  </div>
                  <div className="comment-content">
                    <h4>{c.name} <span>• {c.role}</span></h4>
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="exh-sidebar-section">
            <div className="exh-sidebar-card">
              <h3>Куратор / Художниця</h3>
              <div className="author-flex">
                <img src={exh.artist_avatar || `https://ui-avatars.com/api/?name=${exh.artist_name}&background=cbd5e0&color=fff&size=200`} alt={exh.artist_name} />
                <div>
                  <h4>{exh.artist_name}</h4>
                  <span>Україна</span>
                  <Link to={`/artist/${exh.artist_id}`} className="link-underlined">Переглянути профіль &rarr;</Link>
                </div>
              </div>
            </div>

            {/* БЛОК ІНВЕСТИЦІЙ */}
            {goalLimit > 0 && (
              <div className="exh-sidebar-card">
                <h3>Підтримати проєкт</h3>
                <div className="invest-amount" style={{fontSize:'2.5rem'}}>{currentFunding.toLocaleString('uk-UA')} ₴</div>
                <span className="invest-target" style={{marginBottom:'10px'}}>Ціль: {goalLimit.toLocaleString('uk-UA')} ₴</span>
                
                <div className="progress-container" style={{ height: '6px', marginBottom: '20px' }}>
                  <div className="progress-bar" style={{ width: `${progress}%`, background: '#10b981' }}></div>
                </div>
                <p style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '30px' }}>{progress}%</p>

                <form className="invest-form" onSubmit={handleInvest}>
                  <label>Сума підтримки (₴)</label>
                  <input type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} placeholder="Сума внеску..." className="modern-input" style={{marginBottom:'10px'}} required />
                  <button type="submit" className="btn-dash-primary" style={{ width: '100%', borderRadius:'12px', padding:'14px' }}>Зробити внесок</button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* 3. НИЖНІЙ БЛОК: КАРУСЕЛЬ РЕАЛЬНИХ РОБІТ НА ВИСТАВЦІ */}
        <div className="exh-artworks-section">
          <div className="exh-artworks-header">
            <h2>Роботи на виставці ({exh.artworks ? exh.artworks.length : 0})</h2>
            <Link to="/catalog" className="link-underlined" style={{ border: 'none', fontWeight: 600 }}>Переглянути всі роботи &rarr;</Link>
          </div>
          
          <div className="exh-artworks-slider">
            {exh.artworks && exh.artworks.length > 0 ? (
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={30}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  992: { slidesPerView: 3 },
                  1200: { slidesPerView: 4 },
                }}
              >
                {exh.artworks.map(art => (
                  <SwiperSlide key={art.id}>
                    <div className="art-card" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                      <div className="art-img-wrapper" style={{ borderRadius: '20px', height: '300px' }}>
                        <Link to={`/artwork/${art.id}`}><img src={art.image_url} alt={art.title} /></Link>
                        <button className="btn-wishlist"><i className="fa-regular fa-heart"></i></button>
                      </div>
                      <div style={{ padding: '15px 0' }}>
                        <Link to={`/artwork/${art.id}`} style={{ textDecoration: 'none' }}>
                           <h3 style={{ fontSize: '1.15rem', margin: '0 0 5px', color: 'var(--text-main)', cursor: 'pointer' }}>{art.title}</h3>
                        </Link>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', margin: '0 0 10px' }}>{art.size ? `${art.size} см` : 'Розмір не вказано'}, {art.tech || 'акрил'}</p>
                        <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{art.price} ₴</strong>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', textAlign: 'center', padding: '40px 0' }}>У цій виставці ще немає представлених робіт.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}