import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Artists.css';

// Словник перекладу категорій (Такий самий, як у Каталозі)
const categoryNames = {
  abstract: 'Абстракція',
  modern: 'Модерн / Сучасне мистецтво',
  renaissance: 'Ренесанс / Класика',
  portrait: 'Портрет',
  landscape: 'Пейзаж',
  graphics: 'Графіка',
  sculpture: 'Скульптура'
};

// Зворотний словник: "Абстракція" -> "abstract" (бо в базі лежить українське слово зі skills, а фільтри англійські)
const getCategoryKey = (ukrName) => {
  const found = Object.entries(categoryNames).find(([key, val]) => val.includes(ukrName));
  return found ? found[0] : 'abstract'; // Якщо не знайдено - ставимо дефолт
};

export default function Artists() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  
  // СТАН ДЛЯ ХУДОЖНИКІВ З БАЗИ ДАНИХ
  const [artists, setArtists] = useState([]);

  // Завантажуємо реальних художників при відкритті сторінки
  useEffect(() => {
    fetch('http://localhost:5000/api/artists')
      .then(res => res.json())
      .then(data => setArtists(data))
      .catch(err => console.error('Помилка завантаження художників:', err));
  }, []);

  // ФІЛЬТРАЦІЯ
  const filteredArtists = artists.filter((artist) => {
    // Беремо перший стиль художника (якщо він є) для бейджика і фільтрації
    const mainSkill = artist.skills ? artist.skills.split(',')[0].trim() : 'Абстракція';
    const artistCategoryKey = getCategoryKey(mainSkill);

    const matchCategory = activeFilter === 'all' || artistCategoryKey === activeFilter;
    const matchSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <main className="page-standard-padding">
      <section className="site-container pb-5">
        
        <div className="page-header-block">
          <h1 className="font-serif">Наші художники</h1>
          <p className="text-muted">Творці, що формують обличчя сучасного українського мистецтва. Відкрийте для себе нові імена та унікальні бачення.</p>
          
          <div className="exh-controls">
            
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Пошук за прізвищем..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>

            {/* ДИНАМІЧНИЙ ФІЛЬТР (Як у Каталозі) */}
            <div className={`filter-dropdown-wrapper ${activeFilter !== 'all' ? 'has-active' : ''}`} 
                 onMouseEnter={(e) => e.currentTarget.classList.add('open')}
                 onMouseLeave={(e) => e.currentTarget.classList.remove('open')}
            >
              <button className="btn-filter-toggle">
                <span>
                  <i className="fa-solid fa-filter" style={{ marginRight: '8px' }}></i> 
                  {activeFilter === 'all' ? 'Усі напрямки' : categoryNames[activeFilter]}
                </span>
                <i className="fa-solid fa-chevron-down"></i>
              </button>

              <div className="filter-dropdown-menu">
                <div className={`filter-option ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                  <div className="filter-checkbox">{activeFilter === 'all' && <i className="fa-solid fa-check"></i>}</div>
                  <span>Всі напрямки</span>
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

        {/* СІТКА ХУДОЖНИКІВ */}
        <div className="artists-grid mt-5">
          {filteredArtists.slice(0, visibleCount).map((artist) => {
            
            // Беремо перший скіл для бейджика
            const mainSkillUkr = artist.skills ? artist.skills.split(',')[0].trim() : 'Художник';

            return (
              <div className="artist-card" key={artist.id}>
                <div className="artist-img-wrapper">
                  <img 
                    src={artist.avatar_url || `https://ui-avatars.com/api/?name=${artist.name}&background=cbd5e0&color=fff&size=500`} 
                    alt={artist.name} 
                  />
                  <span className="style-badge">{mainSkillUkr}</span>
                </div>
                <div className="artist-info">
                  <h2 className="font-serif">{artist.name}</h2>
                  {/* Показуємо шматочок біографії, якщо вона є */}
                  <p className="artist-bio">
                    {artist.bio ? (artist.bio.length > 120 ? artist.bio.substring(0, 120) + '...' : artist.bio) : 'Художник ще не додав інформацію про себе.'}
                  </p>
                  <div className="artist-bottom-row">
                  <Link to={`/artist/${artist.id}`} className="btn-view-profile" style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
                    Портфоліо
                  </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* КНОПКИ ПАГІНАЦІЇ */}
        <div className="text-center pt-4" style={{ paddingBottom: '60px' }}>
          {visibleCount < filteredArtists.length ? (
            <button className="btn-load-more" onClick={() => setVisibleCount(visibleCount + 3)}>Показати більше</button>
          ) : filteredArtists.length > 6 ? (
            <button className="btn-load-more" onClick={() => setVisibleCount(6)}>Показати менше</button>
          ) : null}
        </div>
        
        {filteredArtists.length === 0 && (
          <div className="text-center pb-5 pt-4" style={{ color: 'var(--gray-text)' }}>
            <i className="fa-solid fa-users-slash" style={{ fontSize: '3rem', marginBottom: '15px' }}></i>
            <h3>Нічого не знайдено</h3>
            <p>Спробуйте змінити критерії пошуку.</p>
          </div>
        )}

      </section>
    </main>
  );
}