import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Exhibition.css';

export default function Exhibition() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exhibitions, setExhibitions] = useState([]); 

  useEffect(() => {
    fetch('https://vagallery-backend.onrender.com/api/exhibitions')
      .then(res => res.json())
      .then(data => setExhibitions(data))
      .catch(err => console.error('Помилка завантаження виставок:', err));
  }, []);

  // --- ЛОГІКА АВТОМАТИЧНОГО ВИЗНАЧЕННЯ СТАТУСУ ---
  const getAutoStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) return 'upcoming'; // Запланована
    if (today > end) return 'past';      // Минула
    return 'current';                    // Триває зараз
  };

  // --- ФІЛЬТРАЦІЯ ---
  const filteredExhibitions = exhibitions.filter((exh) => {
    const autoStatus = getAutoStatus(exh.start_date, exh.end_date);
    const matchSearch = exh.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchSearch;

    // Вкладка "Збір коштів": показуємо всі, де встановлена ціль по грошах
    if (activeFilter === 'funding') {
      return Number(exh.funding_goal) > 0 && matchSearch;
    }

    // Для вкладок "Поточні" та "Минулі" порівнюємо з автоматичним статусом
    // Примітка: "upcoming" також показуємо в "all" або можна додати окрему вкладку
    return autoStatus === activeFilter && matchSearch;
  });

  // Функція для гарного форматування дати
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <main className="page-standard-padding">
      <section className="site-container">
        
        <div className="page-header-block">
          <h1 className="font-serif">Виставки</h1>
          <p className="text-muted">Відкривайте для себе сучасне українське мистецтво: від концептів, що потребують підтримки, до діючих експозицій.</p>
          
          <div className="exh-controls">
            <div className="filter-tabs">
              <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>Всі</button>
              <button className={`filter-tab ${activeFilter === 'funding' ? 'active' : ''}`} onClick={() => setActiveFilter('funding')}>Збір коштів</button>
              <button className={`filter-tab ${activeFilter === 'current' ? 'active' : ''}`} onClick={() => setActiveFilter('current')}>Поточні</button>
              <button className={`filter-tab ${activeFilter === 'past' ? 'active' : ''}`} onClick={() => setActiveFilter('past')}>Минулі</button>
            </div>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Пошук за назвою..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
        </div>

        <div className="exh-grid pb-5">
          {filteredExhibitions.map((exh) => {
            const currentStatus = getAutoStatus(exh.start_date, exh.end_date);
            
            // Читаємо суму збору
            const currentFunding = Number(exh.current_funding);
            const goal = Number(exh.funding_goal);

            let progress = 0;
            if (goal > 0) {
                progress = Math.round((currentFunding / goal) * 100);
            }

            return (
              <div className="exh-card" key={exh.id}>
                
                <div className="exh-card-img">
                  <img 
                    src={exh.image_url} 
                    alt={exh.title} 
                    className={currentStatus === 'past' ? 'grayscale' : ''} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800'; }}
                  />
                  {goal > 0 && currentStatus !== 'past' && (
                    <div className="funding-overlay">
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                      </div>
                      <span>Зібрано {progress}% на реалізацію</span>
                    </div>
                  )}
                </div>

                <div className="exh-card-info">
                  
                  <div>
                    <span className="exh-date-label">
                      {formatDate(exh.start_date)} — {formatDate(exh.end_date)}
                    </span>
                    <h2 className="font-serif">{exh.title}</h2>
                    <p className="exh-location"><i className="fa-solid fa-location-dot"></i> {exh.location}</p>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    
                    {/* Логіка кнопок залежно від статусу та наявності збору */}
                    {goal > 0 && currentFunding < goal && currentStatus !== 'past' ? (
                      <Link to={`/exhibition/${exh.id}`} className="btn-invest" style={{ textDecoration: 'none' }}>
                        Інвестувати <i className="fa-solid fa-arrow-right-long ms-2"></i>
                      </Link>
                    ) : currentStatus === 'past' ? (
                      <span className="status-past" style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8' }}>Архів виставки</span>
                    ) : (
                      <Link to={`/exhibition/${exh.id}`} className="btn-invest" style={{ background: '#f1f5f9', color: 'var(--text-main)', textDecoration: 'none' }}>
                        Детальніше
                      </Link>
                    )}

                    {exh.artist_name && (
                      <div className="exh-author-min" style={{ marginTop: '20px' }}>
                        <img 
                          src={exh.artist_avatar || `https://ui-avatars.com/api/?name=${exh.artist_name}&background=cbd5e0&color=fff&size=200`} 
                          alt="Author" 
                          className="author-avatar-sm" 
                        />
                        <div className="author-meta">
                          <span className="label">Митець</span>
                          <Link to={`/artist/${exh.artist_id}`} className="author-name">{exh.artist_name}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExhibitions.length === 0 && (
          <div className="text-center pb-5 pt-4" style={{ color: 'var(--gray-text)' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', marginBottom: '15px' }}></i>
            <h3>Нічого не знайдено</h3>
            <p>У цій категорії поки немає виставок.</p>
          </div>
        )}

      </section>
    </main>
  );
}