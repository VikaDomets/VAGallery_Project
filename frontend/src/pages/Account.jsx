import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

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

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  
  // Для додавання картини
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); 
  const [successMsg, setSuccessMsg] = useState('');
  const [isForSale, setIsForSale] = useState(true);

  // ДЛЯ НАЛАШТУВАНЬ (Аватарка профілю)
  const [avatarPreview, setAvatarPreview] = useState(null); 
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null); 
  const [coverFile, setCoverFile] = useState(null);

  // СТАН ДЛЯ МАСИВІВ ДАНИХ
  const [myArtworks, setMyArtworks] = useState([]); 
  const [myCollection, setMyCollection] = useState([]);
  const [myWishlist, setMyWishlist] = useState([]); // Картини в обраному
  const [pendingArtworks, setPendingArtworks] = useState([]); // Для Admina
  const [myExhibitions, setMyExhibitions] = useState([]);
  const [bookedExhibitions, setBookedExhibitions] = useState([]); // Заплановані виставки
  const [myInvestments, setMyInvestments] = useState([]); // Стан інвестицій

  // Стани для виставок
  const [exhPreviewImage, setExhPreviewImage] = useState(null);
  const [exhSelectedFile, setExhSelectedFile] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const availableSkills = ["Абстракція", "Модерн", "Ренесанс", "Портрет", "Пейзаж", "Графіка", "Скульптура"];

  // ==========================================
  // 1. ЗАВАНТАЖЕННЯ ДАНИХ ПРИ ВХОДІ
  // ==========================================
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // 1. Парсимо навички
    if (parsedUser.skills) {
      setSelectedSkills(parsedUser.skills.split(', '));
    }

    // 2. Локальні дані: Колекція, Вподобання, Інвестиції
    const collectionKey = `my_collection_${parsedUser.id}`;
    setMyCollection(JSON.parse(localStorage.getItem(collectionKey)) || []);

    const wishlistKey = `wishlist_${parsedUser.id}`;
    const savedWishlistIds = JSON.parse(localStorage.getItem(wishlistKey)) || [];
    
    const bookedKey = `booked_exhibitions_${parsedUser.id}`;
    setBookedExhibitions(JSON.parse(localStorage.getItem(bookedKey)) || []);

    const investKey = `my_investments_${parsedUser.id}`;
    setMyInvestments(JSON.parse(localStorage.getItem(investKey)) || []);

    // 3. Завантажуємо Wishlist з бекенду, якщо є ID
    if (savedWishlistIds.length > 0) {
      fetch('http://localhost:5000/api/artworks/catalog')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMyWishlist(data.filter(art => savedWishlistIds.includes(art.id)));
          }
        }).catch(err => console.error(err));
    }

    // 4. Встановлюємо вкладку за роллю
    if (parsedUser.role === 'artist') setActiveTab('artist-gallery');
    else if (parsedUser.role === 'investor') setActiveTab('investor-dash');
    else if (parsedUser.role === 'collector') setActiveTab('collector-collection');
    else if (parsedUser.role === 'admin') setActiveTab('admin-moderation'); 

    // 5. ВИТЯГУЄМО ДАНІ З БЕКЕНДУ (ДЛЯ МИТЦЯ ТА АДМІНА)
    if (parsedUser.role === 'artist') {
      // Завантажуємо роботи
      fetch(`http://localhost:5000/api/artworks/artist/${parsedUser.id}`)
        .then(res => res.json())
        .then(data => setMyArtworks(Array.isArray(data) ? data : []))
        .catch(() => setMyArtworks([]));

      // ЗАВАНТАЖУЄМО ВИСТАВКИ (ВИПРАВЛЕНО!)
      fetch(`http://localhost:5000/api/exhibitions/artist/${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
          // ТУТ ВАЖЛИВО: примусово робимо масивом, щоб .map() не ламався
          const exhibitionsArray = Array.isArray(data) ? data : [];
          setMyExhibitions(exhibitionsArray);
        })
        .catch(err => {
          console.error('Помилка виставок:', err);
          setMyExhibitions([]);
        });
    }

    if (parsedUser.role === 'admin') {
      fetch(`http://localhost:5000/api/artworks/pending`)
        .then(res => res.json())
        .then(data => setPendingArtworks(Array.isArray(data) ? data : []))
        .catch(() => setPendingArtworks([]));
    }
  }, [navigate]);

  // ==========================================
  // 2. ФУНКЦІЇ ДЛЯ НАЛАШТУВАНЬ ПРОФІЛЮ
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('email', e.target.email.value); 
    formData.append('phone', e.target.phone.value);
    formData.append('city', e.target.city ? e.target.city.value : '');
    formData.append('country', e.target.country ? e.target.country.value : '');
    formData.append('bio', e.target.bio ? e.target.bio.value : '');
    formData.append('skills', selectedSkills.join(', ')); 
    formData.append('is_for_sale', isForSale);
    
    if (avatarFile) formData.append('avatar', avatarFile);
    if (coverFile) formData.append('cover', coverFile); 

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, { method: 'PUT', body: formData });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        alert('Профіль успішно оновлено!');
      }
    } catch (err) { alert('Помилка оновлення'); }
  };

  // ==========================================
  // 3. ФУНКЦІЇ ДЛЯ КАРТИН (МИТЕЦЬ)
  // ==========================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); 
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

// ФУНКЦІЯ ДОДАВАННЯ КАРТИНИ (З РЕАЛЬНОЮ ПРИВ'ЯЗКОЮ ДО ВИСТАВКИ!)
const handleAddArtwork = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('artist_id', user.id);
  formData.append('title', e.target.title.value);
  formData.append('category', e.target.category.value);
  formData.append('price', e.target.price.value);
  formData.append('description', e.target.description.value);
  formData.append('size', e.target.size.value); 
  formData.append('tech', e.target.tech.value);
  
  // НАЙВАЖЛИВІШИЙ РЯДОК: Передаємо ID виставки на сервер!
  if (e.target.exhibition_id && e.target.exhibition_id.value) {
    formData.append('exhibition_id', e.target.exhibition_id.value);
  }
  
  if (selectedFile) formData.append('image', selectedFile);

  try {
    const response = await fetch('http://localhost:5000/api/artworks', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json(); 
      
      setSuccessMsg('Роботу успішно відправлено на модерацію та перевірку на плагіат!');
      e.target.reset();
      setPreviewImage(null);
      setSelectedFile(null); 
      setMyArtworks([data.artwork, ...myArtworks]); 
      
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('artist-gallery'); 
      }, 3000);

    } else {
      alert('Помилка при додаванні роботи.');
    }
  } catch (err) {
    console.error(err);
    alert('Помилка з\'єднання з сервером.');
  }
};
  // ОБРОБКА ФОТО ДЛЯ ВИСТАВКИ
  const handleExhImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExhSelectedFile(file); 
      setExhPreviewImage(URL.createObjectURL(file));
    }
  };

  // ВІДПРАВКА ФОРМИ ВИСТАВКИ НА БЕКЕНД
const handleAddExhibition = async (e) => {
  e.preventDefault();
  
  // Перевірка, чи ми обрали дати
  if (!startDate || !endDate) {
      alert("Будь ласка, оберіть дату початку та завершення виставки!");
      return;
  }

  const form = e.target;
  const formData = new FormData();

  formData.append('start_date', startDate);
  formData.append('end_date', endDate);
  formData.append('artist_id', user.id);
  formData.append('title', form.title.value);
  formData.append('location', form.location.value);
  formData.append('description', form.description.value);
  const fundingGoal = form.funding_goal.value;
  if (fundingGoal) {
      formData.append('funding_goal', fundingGoal);
  }
  if (exhSelectedFile) {
      formData.append('image', exhSelectedFile);
  }
  try {
    const response = await fetch('http://localhost:5000/api/exhibitions', { 
        method: 'POST', 
        body: formData 
    });
    if (response.ok) {
      const data = await response.json(); 
      alert('Виставку успішно створено!');
      
      form.reset();
      setStartDate('');
      setEndDate('');
      setExhPreviewImage(null);
      setExhSelectedFile(null); 

      const newExh = data.exhibition || data;
      setMyExhibitions([newExh, ...myExhibitions]);

      setActiveTab('artist-gallery');
    } else {
      alert('Помилка при створенні на сервері');
    }
  } catch (err) { 
      console.error(err);
      alert('Помилка з\'єднання'); 
  }
};

  const handleDeleteArtwork = async (id) => {
    const isConfirmed = window.confirm("Ви впевнені, що хочете видалити цю роботу?");
    if (isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/artworks/${id}`, { method: 'DELETE' });
        if (response.ok) setMyArtworks(myArtworks.filter(art => art.id !== id));
      } catch (err) { console.error(err); }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/artworks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setPendingArtworks(pendingArtworks.filter(art => art.id !== id));
        alert(`Картину успішно ${newStatus === 'approved' ? 'схвалено' : 'відхилено'}!`);
      }
    } catch (err) { console.error(err); }
  };

  if (!user) return null;
// ДИНАМІЧНИЙ ПІДРАХУНОК ЗАПОВНЕНОСТІ ПРОФІЛЮ ЗА РОЛЯМИ
const calculateProfileProgress = () => {
  if (!user) return 0;
  let score = 0;
  
  if (user.role === 'artist') {
    // Для Митця - 10 полів (по 10% кожне)
    if (user.name) score += 10;
    if (user.email) score += 10;
    if (user.phone) score += 10;
    if (user.birthday) score += 10;
    if (user.city) score += 10;     
    if (user.country) score += 10;  
    if (user.bio) score += 10;
    if (selectedSkills.length > 0) score += 10;
    if (user.avatar_url || avatarPreview) score += 10;
    if (user.cover_url || coverPreview) score += 10;
  } else {
    // Для Поціновувача та Інвестора - тільки 5 полів (по 20% кожне)
    if (user.name) score += 20;
    if (user.email) score += 20;
    if (user.phone) score += 20;
    if (user.birthday) score += 20;
    if (user.avatar_url || avatarPreview) score += 20;
  }
  
  return score;
};

const profileProgress = calculateProfileProgress();
  const calculateAge = (birthday) => {
    if (!birthday) return "";
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getAutoStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) return { label: 'Запланована', class: 'status-upcoming' };
    if (today > end) return { label: 'Минула', class: 'status-past' };
    return { label: 'Триває зараз', class: 'status-current' };
  };

  const handleDeleteExhibition = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю виставку?")) {
      try {
        await fetch(`http://localhost:5000/api/exhibitions/${id}`, { method: 'DELETE' });
        // Онови локальний список (заміни myExhibitions на назву свого стейту)
        setMyExhibitions(prev => prev.filter(e => e.id !== id));
      } catch (err) { alert("Помилка видалення"); }
    }
  };
  
  return (
    <main className="dashboard-page">
      <div className="dash-container">
        
        {/* ================= ЛІВА ПАНЕЛЬ ================= */}
        <aside className="dash-sidebar">
          <div className="dash-profile-info" style={{ flexDirection: 'column', alignItems: 'flex-start', border: 'none', paddingBottom: '0' }}>
            <h2 className="dash-name" style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{user.name}</h2>
            <div className="dash-role-badge" style={{ padding: 0, background: 'transparent' }}>
              {user.role === 'artist' && <span style={{ color: 'var(--gray-text)', fontSize: '1rem' }}>Митець</span>}
              {user.role === 'investor' && <span style={{ color: 'var(--gray-text)', fontSize: '1rem' }}>Інвестор</span>}
              {user.role === 'collector' && <span style={{ color: 'var(--gray-text)', fontSize: '1rem' }}>Поціновувач</span>}
              {user.role === 'admin' && <span style={{color: '#dc2626', fontSize: '1rem'}}>Адміністратор</span>}
            </div>

            {/* ОСЬ ЦЕЙ НОВИЙ РЯДОК З ЛОКАЦІЄЮ ТА ВІКОМ */}
            {user.role !== 'admin' && (
            <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', margin: '5px 0 0 0', opacity: 0.8 }}>
              {user.city || 'Місто'}, {user.country || 'Україна'}
              {user.birthday && ` • ${calculateAge(user.birthday)} роки`}
            </p>
            )}
          </div>

          {user.role === 'artist' && (
            <div className="dash-progress-box" style={{ marginTop: '20px' }}>
              <div className="progress-text">
                <span>Заповненість профілю</span>
                <span className="progress-percent">{profileProgress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${profileProgress}%` }}></div>
              </div>
              {profileProgress < 100 && (
                <p className="progress-hint">Заповніть профіль на 100% для верифікації.</p>
              )}
            </div>
          )}

          <nav className="dash-nav">

            {/* МЕНЮ МИТЦЯ (Специфічне) */}
            {user.role === 'artist' && (
              <>
                <button className={`dash-nav-item ${activeTab === 'artist-gallery' ? 'active' : ''}`} onClick={() => setActiveTab('artist-gallery')}><i className="fa-solid fa-image"></i> Мої роботи</button>
                <button className={`dash-nav-item ${activeTab === 'artist-add' ? 'active' : ''}`} onClick={() => setActiveTab('artist-add')}><i className="fa-solid fa-plus-square"></i> Додати роботу</button>
                <button className={`dash-nav-item ${activeTab === 'artist-funding' ? 'active' : ''}`} onClick={() => setActiveTab('artist-funding')}><i className="fa-solid fa-bullhorn"></i> Мої збори (Виставки)</button>
              </>
            )}
            
            {/* МЕНЮ ІНВЕСТОРА (Специфічне) */}
            {user.role === 'investor' && (
              <button className={`dash-nav-item ${activeTab === 'investor-dash' ? 'active' : ''}`} onClick={() => setActiveTab('investor-dash')}><i className="fa-solid fa-wallet"></i> Мої інвестиції</button>
            )}

            {/* СПІЛЬНИЙ ПУНКТ - ПРИДБАНІ (крім адміна) */}
            {user.role !== 'admin' && (
              <>
              <button className={`dash-nav-item ${activeTab === 'collector-collection' ? 'active' : ''}`} onClick={() => setActiveTab('collector-collection')}><i className="fa-solid fa-box-open"></i> Придбані картини</button>
              <button className={`dash-nav-item ${activeTab === 'collector-wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('collector-wishlist')}><i className="fa-solid fa-heart"></i> Мої вподобання</button>
              <button className={`dash-nav-item ${activeTab === 'collector-exhibitions' ? 'active' : ''}`} onClick={() => setActiveTab('collector-exhibitions')}><i className="fa-solid fa-calendar-days"></i> Заплановані виставки</button>
              </>
            )}

            {/* МЕНЮ АДМІНА */}
            {user.role === 'admin' && (
              <>
                <button className={`dash-nav-item ${activeTab === 'admin-moderation' ? 'active' : ''}`} onClick={() => setActiveTab('admin-moderation')}><i className="fa-solid fa-scale-balanced"></i> Модерація робіт</button>
                <button className={`dash-nav-item ${activeTab === 'admin-users' ? 'active' : ''}`} onClick={() => setActiveTab('admin-users')}><i className="fa-solid fa-users-gear"></i> Верифікація митців</button>
              </>
            )}
            
            <button className={`dash-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><i className="fa-solid fa-gear"></i> Налаштування</button>
          </nav>

          <div className="dash-logout">
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 20px' }}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Вийти з акаунта
            </button>
          </div>
        </aside>

        {/* ================= КОНТЕНТ ================= */}
        <section className="dash-content">
          <div className="content-header">
            <h1>
              {activeTab === 'artist-gallery' && 'Моя галерея'}
              {activeTab === 'artist-add' && 'Додавання нової роботи'}
              {activeTab === 'artist-funding' && 'Додавання нової виставки'}
              {activeTab === 'investor-dash' && 'Панель інвестора'}
              {activeTab === 'investor-portfolio' && 'Інвестиційний портфель'}
              {activeTab === 'collector-collection' && 'Придбані картини'}
              {activeTab === 'collector-wishlist' && 'Мої вподобання'}
              {activeTab === 'collector-exhibitions' && 'Заплановані виставки'}
              {activeTab === 'admin-moderation' && 'Перевірка на плагіат та модерація'}
              {activeTab === 'admin-users' && 'Управління користувачами'}
              {activeTab === 'settings' && 'Налаштування профілю'}
            </h1>
          </div>

          {/* ---------------- МИТЕЦЬ: МОЯ ГАЛЕРЕЯ (РОБОТИ + ВИСТАВКИ) ---------------- */}
          {activeTab === 'artist-gallery' && (
            <div className="my-gallery-wrapper">
              
              {/* === СЕКЦІЯ 1: МОЇ РОБОТИ === */}
              <div className="gallery-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 className="font-serif" style={{ fontSize: '2rem', color: 'var(--text-main)' }}>Мої роботи</h2>
                <button className="btn-dash-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }} onClick={() => setActiveTab('artist-add')}>+ Додати роботу</button>
              </div>

              {myArtworks.length === 0 ? (
                <div className="empty-state-box" style={{ padding: '40px', background: '#f8fafc', borderRadius: '20px', textAlign: 'center', marginBottom: '60px' }}>
                  <p className="text-muted">У вас ще немає доданих робіт.</p>
                </div>
              ) : (
                <div className="dash-grid mt-4" style={{ marginBottom: '80px' }}> 
                  {myArtworks.map(art => (
                    <div className="dash-card" key={art.id} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '20px', overflow: 'hidden' }}>
                      <div className="card-img-placeholder" style={{ backgroundImage: `url(${art.image_url})`, backgroundPosition: 'center', backgroundSize: 'cover', height: '250px' }}></div>
                      <div className="card-info" style={{ flexGrow: 1, padding: '20px' }}>
                        <span className="style-badge" style={{ position:'static', border:'1px solid #cbd5e0', marginBottom:'10px', display:'inline-block' }}>{categoryNames[art.category] || art.category}</span>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{art.title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{art.price} ₴</span>
                          {art.status === 'pending' && <span className="status-badge status-pending">Очікує перевірки</span>}
                          {art.status === 'approved' && <span className="status-badge status-approved">Опубліковано</span>}
                          {art.status === 'sold' && <span className="status-badge" style={{ background: '#e2e8f0', color: '#64748b' }}>Продано</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
                        <button onClick={() => alert('Редагування в розробці')} style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#64748b', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }}>Редагувати</button>
                        <button onClick={() => handleDeleteArtwork(art.id)} style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#ef4444', cursor: 'pointer' }}>Видалити</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '60px' }} />

              {/* === СЕКЦІЯ 2: МОЇ ВИСТАВКИ === */}
              <div className="gallery-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 className="font-serif" style={{ fontSize: '2rem', color: 'var(--text-main)' }}>Мої виставки</h2>
                <button className="btn-dash-primary" style={{ padding: '10px 20px', fontSize: '0.9rem', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid #cbd5e0' }} onClick={() => setActiveTab('artist-funding')}>+ Створити виставку</button>
              </div>

              {myExhibitions.length === 0 ? (
                <div className="empty-state-box" style={{ padding: '40px', background: '#f8fafc', borderRadius: '20px', textAlign: 'center' }}>
                  <p className="text-muted">Ви ще не створили жодної виставки.</p>
                </div>
              ) : (
                <div className="dash-grid mt-4">
                  {myExhibitions.map(exh => {
                    // Визначаємо статус за датами (Функція має бути оголошена вище в компоненті)
                    const statusData = getAutoStatus(exh.start_date, exh.end_date);
                    
                    return (
                      <div className="dash-card" key={exh.id} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        <div className="card-img-placeholder" style={{ backgroundImage: `url(${exh.image_url})`, backgroundPosition: 'center', backgroundSize: 'cover', height: '200px' }}></div>
                        <div className="card-info" style={{ padding: '20px' }}>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{exh.title}</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={`status-badge ${statusData.class}`}>{statusData.label}</span>
                            {exh.funding_goal > 0 && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Збір коштів</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0' }}>
                          <button onClick={() => alert('Редагування в розробці')} style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#64748b', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }}>Редагувати</button>
                          <button onClick={() => handleDeleteExhibition(exh.id)} style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px', color: '#ef4444', cursor: 'pointer' }}>Видалити</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---------------- МИТЕЦЬ: ДОДАТИ РОБОТУ ---------------- */}
          {activeTab === 'artist-add' && (
            <form className="add-work-form" onSubmit={handleAddArtwork}>
              {successMsg && (
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '15px 20px', borderRadius: '10px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                  <i className="fa-solid fa-circle-check"></i>
                  {successMsg}
                </div>
              )}
              <div className="add-work-grid">
                <div className="upload-section">
                  <label>Завантажте зображення (Оригінал)</label>
                  <label className="upload-box" style={{ padding: previewImage ? '0' : '20px', overflow: 'hidden' }}>
                      <input type="file" accept="image/*" onChange={handleImageChange} required style={{ display: 'none' }} />
                      {previewImage ? (
                        <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="upload-box-content">
                          <i className="fa-solid fa-arrow-up-from-bracket"></i>
                          <p>Натисніть для вибору файлу</p>
                          <span>JPG, PNG до 15MB</span>
                        </div>
                      )}
                  </label>
                  {previewImage && (
                    <button type="button" onClick={() => setPreviewImage(null)} style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', alignSelf: 'center' }}>
                      Видалити фото
                    </button>
                  )}
                </div>

              {/* 2. БЛОК ІНФОРМАЦІЇ (ОНОВЛЕНИЙ З ВИБОРОМ ВИСТАВКИ) */}
              <div className="info-section">
                  <div className="input-group">
                      <label>Назва роботи</label>
                      <input type="text" name="title" className="modern-input" placeholder="Введіть назву" required />
                  </div>
                  
                  <div className="input-group" style={{ marginTop: '15px' }}>
                      <label>Стиль / Категорія</label>
                      <select name="category" className="modern-input" required>
                          <option value="">Оберіть категорію</option>
                          <option value="abstract">Абстракція</option>
                          <option value="modern">Модерн / Сучасне мистецтво</option>
                          <option value="renaissance">Ренесанс / Класика</option>
                          <option value="portrait">Портрет</option>
                          <option value="landscape">Пейзаж</option>
                          <option value="graphics">Графіка</option>
                          <option value="sculpture">Скульптура</option>
                      </select>
                  </div>
                  
                  <div className="input-group" style={{ marginTop: '15px' }}>
                      <label>Техніка виконання</label>
                      <select name="tech" className="modern-input" required>
                          <option value="">Оберіть техніку</option>
                          <option value="Олія">Олія</option>
                          <option value="Акрил">Акрил</option>
                          <option value="Акварель">Акварель</option>
                          <option value="Гуаш">Гуаш</option>
                          <option value="Змішана техніка">Змішана техніка</option>
                          <option value="Графіка / Олівець">Графіка / Олівець</option>
                          <option value="Цифровий живопис">Цифровий живопис</option>
                          <option value="Глина / Метал">Глина / Метал</option>
                      </select>
                  </div>

                  {/* >>> НОВЕ ПОЛЕ ДЛЯ ПРИВ'ЯЗКИ КАРТИНИ ДО ВИСТАВКИ <<< */}
                  <div className="input-group" style={{ marginTop: '15px' }}>
                      <label>Прив'язати до виставки (необов'язково)</label>
                      <select name="exhibition_id" className="modern-input">
                          <option value="">Без виставки (тільки в каталог)</option>
                          {myExhibitions.map(exh => (
                              <option key={exh.id} value={exh.id}>{exh.title}</option>
                          ))}
                      </select>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label>Розмір (см)</label>
                        <input type="text" name="size" className="modern-input" placeholder="80x100" required />
                    </div>
                    <div className="form-group">
                      <label>Призначення роботи</label>
                      <select 
                        name="is_for_sale"
                        onChange={(e) => setIsForSale(e.target.value)} // Передаємо рядок "true" або "false"
                      >
                        <option value="true">Виставити на продаж</option>
                        <option value="false">Тільки в портфоліо</option>
                      </select>
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label>Ціна (₴)</label>
                        <input type="number" name="price" className="modern-input" placeholder="5000" required />
                    </div>
                  </div>
                </div>
              </div>
              <div className="input-group" style={{ marginTop: '40px' }}>
                  <label>Історія / Опис роботи</label>
                  <textarea name="description" className="modern-input" placeholder="Опишіть концепцію..." rows="5" required></textarea>
              </div>
              <div className="form-actions-bottom" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                  <button type="submit" className="btn-dash-primary" style={{ padding: '15px 40px', fontSize: '1.05rem', borderRadius: '50px' }}>Відправити на модерацію</button>
              </div>
            </form>
          )}

          {/* ---------------- МИТЕЦЬ: ВИСТАВКИ ---------------- */}
          {activeTab === 'artist-funding' && (
            <form className="add-work-form" onSubmit={handleAddExhibition}>
              <div className="add-work-grid">
                <div className="upload-section">
                  <label>Обкладинка виставки</label>
                  <label className="upload-box" style={{ padding: exhPreviewImage ? '0' : '20px', overflow: 'hidden', height: '280px' }}>
                      <input type="file" accept="image/*" onChange={handleExhImageChange} required style={{ display: 'none' }} />
                      {exhPreviewImage ? (
                        <img src={exhPreviewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="upload-box-content">
                          <i className="fa-solid fa-camera-retro"></i>
                          <p>Натисніть для вибору файлу</p>
                          <span>JPG, PNG. Горизонтальний формат</span>
                        </div>
                      )}
                  </label>
                  {exhPreviewImage && (
                    <button type="button" onClick={() => setExhPreviewImage(null)} style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', alignSelf: 'center' }}>
                      Видалити фото
                    </button>
                  )}
                </div>

                <div className="info-section">
                  <div className="input-group">
                      <label>Назва виставки</label>
                      <input type="text" name="title" className="modern-input" placeholder="Напр: Між світлом і тінню" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                      <div className="input-group">
                          <label>Дата початку</label>
                          <input 
                            type="date" 
                            name="start_date" 
                            className="modern-input" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            required 
                          />
                      </div>
                      <div className="input-group">
                          <label>Дата завершення</label>
                          <input 
                            type="date" 
                            name="end_date" 
                            className="modern-input" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            required 
                          />
                      </div>
                    </div>
                  <div className="input-group" style={{ marginTop: '15px' }}>
                      <label>Локація</label>
                      <input type="text" name="location" className="modern-input" placeholder="Київ, Мистецький Арсенал" required />
                  </div>
                  <div className="input-group" style={{ marginTop: '15px', background: '#f8fafc', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                      <label style={{ color: '#10b981' }}><i className="fa-solid fa-coins"></i> Ціль збору коштів (₴)</label>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-text)', margin: '0 0 10px 0' }}>Залиште порожнім, якщо виставка не потребує фінансування.</p>
                      <input type="number" name="funding_goal" className="modern-input" placeholder="Наприклад: 100000" style={{ background: '#fff' }} />
                  </div>
                </div>
              </div>
              <div className="input-group" style={{ marginTop: '40px' }}>
                  <label>Опис концепції виставки</label>
                  <textarea name="description" className="modern-input" placeholder="Розкажіть про ідею виставки..." rows="4" required></textarea>
              </div>
              <div className="form-actions-bottom" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                  <button type="submit" className="btn-dash-primary" style={{ padding: '15px 40px', fontSize: '1.05rem', borderRadius: '50px' }}>Створити проєкт</button>
              </div>
            </form>
          )}

{/* ---------------- ІНВЕСТОР: МОЇ ІНВЕСТИЦІЇ (ОБ'ЄДНАНА СТАТИСТИКА ТА КАРТКИ) ---------------- */}
        {activeTab === 'investor-dash' && (
            <div>
              {/* Квадрати статистики зверху */}
              <div className="investor-stats-grid" style={{ marginBottom: '40px' }}>
                <div className="stat-box"><h2>{myInvestments.length}</h2><p>Підтриманих проєктів</p></div>
                <div className="stat-box"><h2>{myInvestments.length}</h2><p>Інвестицій</p></div>
                <div className="stat-box"><h2>{myInvestments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('uk-UA')} ₴</h2><p>Загальна сума</p></div>
                <div className="stat-box"><h2>{myInvestments.length}</h2><p>Активних проєктів</p></div>
              </div>

              {/* Список підтриманих проєктів знизу */}
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '25px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>Проєкти, які ви підтримали</h3>
              
              {myInvestments.length === 0 ? (
                <div className="empty-state-box">
                  <i className="fa-solid fa-wallet"></i>
                  <h3>Ви ще не підтримали жодного проєкту</h3>
                  <p>Знайдіть перспективні виставки та зробіть свій перший внесок.</p>
                  <button className="btn-dash-primary mt-4" onClick={() => navigate('/exhibition')}>Перейти до проєктів</button>
                </div>
              ) : (
                <div className="dash-grid">
                  {myInvestments.map((inv, index) => (
                    <div className="dash-card" key={index} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                      <div className="card-img-placeholder" style={{ backgroundImage: `url(${inv.img})`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundColor: '#cbd5e0', height: '200px' }}></div>
                      
                      <div className="card-info" style={{ padding: '20px', flexGrow: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{inv.title}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-text)', display: 'block', marginBottom: '15px' }}>Дата внеску: {inv.date}</span>
                        
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.2rem' }}>{inv.amount.toLocaleString('uk-UA')} ₴</span>
                          {/* ВИПРАВЛЕНИЙ БЕЙДЖИК "АКТИВНО" (Заокруглений, не сплюснутий!) */}
                          <span className="status-badge status-approved" style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '8px 15px' }}>
                            <i className="fa-solid fa-chart-line"></i> Активно
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------- КОЛЕКЦІЯ (ДЛЯ ВСІХ) ---------------- */}
          {activeTab === 'collector-collection' && (
            <>
              {myCollection.length === 0 ? (
                <div className="empty-state-box">
                  <i className="fa-solid fa-box-open"></i>
                  <h3>Ваша колекція порожня</h3>
                  <p>Час знайти своє перше унікальне полотно.</p>
                  <button className="btn-dash-primary mt-4" onClick={() => navigate('/catalog')}>Перейти в каталог</button>
                </div>
              ) : (
                <div className="catalog-grid mt-4">
                  {myCollection.map((art, index) => (
                    <div className="art-card" key={index} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                      <div className="art-img-wrapper" style={{ height: '300px' }}>
                        <img src={art.img || art.image_url} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className="style-badge">{art.categoryName || categoryNames[art.category]}</span>
                      </div>
                      <div className="art-info">
                        <h2 className="font-serif">{art.title}</h2>
                        <p className="art-author">автор: {art.author || art.artist_name}</p>
                        <div className="art-bottom-row" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.2rem' }}>{art.price} ₴</span>
                          <span className="status-badge status-approved" style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '8px 15px' }}>
                            <i className="fa-solid fa-check"></i> Придбано
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ---------------- ОБРАНЕ (WISHLIST ДЛЯ ВСІХ) ---------------- */}
          {activeTab === 'collector-wishlist' && (
            <>
              {myWishlist.length === 0 ? (
                <div className="empty-state-box">
                  <i className="fa-regular fa-heart"></i>
                  <h3>У вас немає збережених робіт</h3>
                  <p>Додавайте роботи в обране, щоб не загубити їх.</p>
                  <button className="btn-dash-primary mt-4" onClick={() => navigate('/catalog')}>Перейти в каталог</button>
                </div>
              ) : (
                <div className="catalog-grid mt-4">
                  {myWishlist.map((art) => (
                    <div className="art-card" key={art.id} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                      <div className="art-img-wrapper" style={{ height: '300px' }}>
                        <img src={art.image_url} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className="style-badge">{categoryNames[art.category] || art.category}</span>
                        <button 
                          style={{ position:'absolute', top:'15px', right:'15px', background:'white', border:'none', width:'34px', height:'34px', borderRadius:'50%', color:'#e63946', cursor:'pointer', boxShadow:'0 4px 10px rgba(0,0,0,0.05)' }}
                          onClick={() => {
                            const newWishlist = myWishlist.filter(item => item.id !== art.id);
                            setMyWishlist(newWishlist);
                            localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newWishlist.map(i => i.id)));
                          }}
                        >
                          <i className="fa-solid fa-heart"></i>
                        </button>
                      </div>
                      <div className="card-info" style={{ padding: '20px' }}>
                        <h2 className="font-serif" style={{ fontSize: '1.2rem', margin: '0 0 5px' }}>{art.title}</h2>
                        <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', margin: 0 }}>Автор: {art.artist_name}</p>
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.2rem' }}>{art.price} ₴</span>
                          <button className="btn-dash-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={() => navigate(`/artwork/${art.id}`)}>Детальніше</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ---------------- ДИНАМІЧНА ВКЛАДКА: ЗАПЛАНОВАНІ ВИСТАВКИ (КВИТКИ) ---------------- */}
          {activeTab === 'collector-exhibitions' && (
            <>
              {bookedExhibitions.length === 0 ? (
                <div className="empty-state-box">
                  <i className="fa-solid fa-calendar-xmark"></i>
                  <h3>У вас немає запланованих виставок</h3>
                  <p>Придбайте свій перший квиток, щоб відвідати експозицію.</p>
                  <button className="btn-dash-primary mt-4" onClick={() => navigate('/exhibition')}>Перейти до виставок</button>
                </div>
              ) : (
                <div className="exh-grid mt-4">
                  {bookedExhibitions.map((exh) => (
                    <div className="exh-card" key={exh.id}>
                      <div className="exh-card-img" style={{ height: '220px' }}>
                        <img src={exh.image_url} alt={exh.title} />
                      </div>
                      <div className="exh-card-info" style={{ paddingTop: '20px' }}>
                        <span className="exh-date-label">{exh.date_range}</span>
                        <h2 className="font-serif" style={{ fontSize: '1.4rem' }}>{exh.title}</h2>
                        <p className="exh-location" style={{ marginBottom: '15px' }}><i className="fa-solid fa-location-dot"></i> {exh.location}</p>
                        <span className="status-badge status-approved" style={{ textAlign: 'center', width: '100%', background: '#ecfdf5', color: '#10b981', border: 'none' }}>
                          <i className="fa-solid fa-ticket"></i> Квиток придбано
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ---------------- АДМІНІСТРАТОР: МОДЕРАЦІЯ ---------------- */}
          {activeTab === 'admin-moderation' && (
            <div>
              <p style={{ color: 'var(--gray-text)', marginBottom: '20px' }}>Усі роботи проходять автоматичну перевірку алгоритмами. Тут вимагається ваше фінальне рішення.</p>
              {pendingArtworks.length === 0 ? (
                <div className="empty-state-box" style={{ background: '#fff' }}>
                  <i className="fa-solid fa-check-double" style={{ color: '#10b981' }}></i>
                  <h3>Немає робіт на перевірці</h3>
                  <p>Усі завантажені картини вже опрацьовані.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Назва роботи</th>
                      <th>Автор</th>
                      <th>Ціна</th>
                      <th>Ризик плагіату</th>
                      <th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingArtworks.map(art => (
                      <tr key={art.id}>
                        <td><strong>{art.title}</strong></td>
                        <td>{art.artist_name}</td>
                        <td>{art.price} ₴</td>
                        <td><span className="status-badge status-approved">Низький (0%)</span></td>
                        <td style={{ display: 'flex', gap: '10px' }}>
                          <button className="admin-action-btn btn-approve" onClick={() => handleUpdateStatus(art.id, 'approved')}>
                            <i className="fa-solid fa-check"></i> Схвалити
                          </button>
                          <button className="admin-action-btn btn-reject" onClick={() => handleUpdateStatus(art.id, 'rejected')}>
                            <i className="fa-solid fa-xmark"></i> Відхилити
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          
          {/* ---------------- АДМІНІСТРАТОР: ВЕРИФІКАЦІЯ МИТЦІВ ---------------- */}
          {activeTab === 'admin-users' && (
            <div>
              <p style={{ color: 'var(--gray-text)', marginBottom: '20px' }}>Нові митці, які зареєструвалися на платформі та очікують офіційного підтвердження профілю та портфоліо для виведення на головну сторінку.</p>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ім'я митця</th>
                    <th>E-mail</th>
                    <th>Телефон</th>
                    <th>Статус профілю</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Вікторія Домець</strong></td>
                    <td>victoria@gmail.com</td>
                    <td>+380 67 123 45 67</td>
                    <td><span className="status-badge status-pending">Очікує верифікації</span></td>
                    <td>
                      <button 
                        type="button"
                        className="admin-action-btn btn-approve"
                        onClick={() => alert('Користувача Вікторію Домець успішно верифіковано!')}
                      >
                        <i className="fa-solid fa-user-check"></i> Верифікувати
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Петро Коваль</strong></td>
                    <td>koval@gmail.com</td>
                    <td>+380 93 987 65 43</td>
                    <td><span className="status-badge status-pending">Очікує верифікації</span></td>
                    <td>
                      <button 
                        type="button"
                        className="admin-action-btn btn-approve"
                        onClick={() => alert('Користувача Петра Коваля успішно верифіковано!')}
                      >
                        <i className="fa-solid fa-user-check"></i> Верифікувати
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ---------------- НАЛАШТУВАННЯ ПРОФІЛЮ ---------------- */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '900px' }}>
          <form onSubmit={handleUpdateProfile}>
                 
                 {/* БЛОК БАНЕРА (ОБКЛАДИНКИ) - Показуємо ТІЛЬКИ митцям */}
                 {user.role === 'artist' && (
                   <div style={{ marginBottom: '40px' }}>
                       <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--text-main)', margin: '0 0 15px' }}>Обкладинка профілю</h3>
                       <div style={{ width: '100%', height: '200px', background: '#e2e8f0', borderRadius: '20px', position: 'relative', overflow: 'hidden', marginBottom: '15px' }}>
                         <img 
                           src={coverPreview || user.cover_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000'} 
                           alt="Cover" 
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                         />
                         <label style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 20px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                           <i className="fa-solid fa-camera"></i> Змінити обкладинку
                           <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
                         </label>
                       </div>
                    </div>
                 )}
 
                  {/* Блок аватарки */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ flex: '0 0 140px' }}>
                      <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: '#cbd5e0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <img 
                          src={avatarPreview || user.avatar_url || 'https://ui-avatars.com/api/?name=' + user.name + '&background=cbd5e0&color=fff&size=256'} 
                          alt="Avatar" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--text-main)', margin: '0 0 15px' }}>Фото профілю</h3>
                      <label style={{ display: 'inline-block', background: 'var(--text-main)', color: '#fff', padding: '10px 25px', borderRadius: '50px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', width: 'fit-content' }}>
                        Завантажити нове фото
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                      </label>
                    </div>
                  </div>
 
                  {/* ОСНОВНІ ДАНІ */}
                  <div className="add-work-grid" style={{ gap: '25px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Ім'я та Прізвище</label>
                      <input type="text" name="name" className="modern-input" defaultValue={user.name} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Email</label>
                      <input type="email" name="email" className="modern-input" defaultValue={user.email} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Місто</label>
                      <input type="text" name="city" className="modern-input" defaultValue={user.city || ''} placeholder="Наприклад: Київ" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Країна</label>
                      <input type="text" name="country" className="modern-input" defaultValue={user.country || 'Україна'} />
                    </div>
                    <div style={{ display: 'none' }}>
                       <input type="tel" name="phone" defaultValue={user.phone} />
                    </div>
                  </div>
 
                  {/* СТИЛІ - Показуємо ТІЛЬКИ митцям */}
                  {user.role === 'artist' && (
                    <div style={{ marginTop: '30px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px', display: 'block' }}>Напрямки роботи</label>
                        <div className="skills-container">
                          {availableSkills.map(skill => (
                            <div 
                              key={skill} 
                              className={`skill-pill ${selectedSkills.includes(skill) ? 'active' : ''}`}
                              onClick={() => toggleSkill(skill)}
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                    </div>
                  )}
 
                  {/* БІОГРАФІЯ - Показуємо ТІЛЬКИ митцям */}
                  {user.role === 'artist' && (
                    <div style={{ marginTop: '30px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Біографія / Про себе</label>
                      <textarea name="bio" className="modern-input" defaultValue={user.bio || ''} placeholder="Розкажіть про свій творчий шлях..." rows="5"></textarea>
                    </div>
                  )}
 
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
                    <button type="submit" className="btn-dash-primary" style={{ padding: '15px 50px', fontSize: '1.05rem', borderRadius: '50px' }}>Зберегти зміни</button>
                  </div>
 
                </form>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}