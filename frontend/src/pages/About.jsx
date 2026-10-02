import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectFade, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import '../styles/About.css';

export default function About() {
  const navigate = useNavigate();

  // Логіка для плавної появи блоків при скролі
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 }); // Блок з'явиться, коли 10% його висоти буде на екрані

    // Шукаємо всі елементи з класом reveal і вішаємо на них обсервер
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Очистка при переході на іншу сторінку
    return () => observer.disconnect();
  }, []);

  return (
    <main className="page-standard-padding">
      <section className="site-container">
        
        {/* ВЕРХНЯ СЕКЦІЯ */}
        <div className="about-top-grid reveal">
          <div className="about-top-text">
            <h1 className="font-serif">Ми будуємо майбутнє українського мистецтва</h1>
            <p>Заснована у 2026 році, наша галерея присвячена створенню передових рішень, які дають можливість митцям та інвесторам досягати своїх цілей у новому цифровому світі. Ми віримо, що мистецтво має бути доступним, потужним та трансформаційним.</p>
            <p>Наша платформа — це міст між традиційними цінностями та інноваційними технологіями, що дозволяє кожному учаснику арт-ринку відчути впевненість та підтримку на кожному етапі творчого шляху.</p>
          </div>
          <div className="about-top-image">
            <img src="/img/slide_2.jpg" alt="Gallery" />
          </div>
        </div>

        {/* КАРТКИ МІСІЯ / БАЧЕННЯ */}
        <div className="mission-vision-grid reveal">
          <div className="mv-card">
            <h2 className="font-serif">Наша Місія</h2>
            <p>Демократизувати доступ до мистецтва та інвестицій, надаючи інструменти для розвитку талантів у цифрову епоху. Ми прагнемо будувати спільноту, де творчість не має меж та бар'єрів.</p>
          </div>
          <div className="mv-card">
            <h2 className="font-serif">Наше Бачення</h2>
            <p>Світ, де технології безперешкодно інтегруються з людською креативністю, забезпечуючи безпрецедентний рівень продуктивності, співпраці та культурних інновацій у кожному місті.</p>
          </div>
        </div>

        {/* СЕКЦІЯ ВІДГУКІВ (SWIPER) */}
        <div className="testimonials-modern-section reveal">
          <Swiper
            modules={[Navigation, EffectFade, Autoplay]}
            effect="fade"
            loop={true}
            speed={800}
            autoplay={{ delay: 5000 }}
            navigation={{
              nextEl: '.sw-next',
              prevEl: '.sw-prev',
            }}
          >
            <SwiperSlide>
              <div className="modern-t-card">
                <div className="t-img-box">
                  <img src="/img/ans3.jpg" alt="Artist" />
                </div>
                <div className="t-info-box">
                  <span className="t-category">(ВІДГУК МИТЦЯ)</span>
                  <h2 className="font-serif">Платформа, що <br /> <span className="text-gray">змінює життя</span></h2>
                  <p>"VA Gallery дала мені можливість знайти перших серйозних колекціонерів. Це простір, де цінують кожну деталь творчого процесу."</p>
                  <div className="t-author-meta">
                    <strong>Олена Кравченко</strong>
                    <span>Художниця, м. Київ</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="modern-t-card">
                <div className="t-img-box">
                  <img src="/img/ans2.jpg" alt="Investor" />
                </div>
                <div className="t-info-box">
                  <span className="t-category">(ІНВЕСТОР)</span>
                  <h2 className="font-serif">Інвестиції в <br /> <span className="text-gray">майбутнє культури</span></h2>
                  <p>"Прозорість та можливість прямої підтримки митців роблять цю платформу унікальною для арт-банкінгу в Україні."</p>
                  <div className="t-author-meta">
                    <strong>Марк Волков</strong>
                    <span>Меценат, інвестор</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="modern-t-card">
                <div className="t-img-box">
                  <img src="/img/ans1.jpg" alt="Collector" />
                </div>
                <div className="t-info-box">
                  <span className="t-category">(КОЛЕКЦІОНЕР)</span>
                  <h2 className="font-serif">Унікальність у <br /> <span className="text-gray">кожному полотні</span></h2>
                  <p>"Швидка доставка та сертифікати автентичності дозволяють мені купувати мистецтво впевнено та легко."</p>
                  <div className="t-author-meta">
                    <strong>Дмитро Левченко</strong>
                    <span>Приватний колекціонер</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          {/* Кнопки керування слайдером */}
          <div className="t-controls">
            <div className="sw-prev"><i className="fa-solid fa-chevron-left"></i></div>
            <div className="sw-next"><i className="fa-solid fa-chevron-right"></i></div>
          </div>
        </div>

        {/* СЕКЦІЯ РОЛЕЙ (З головної сторінки) */}
        <div className="roles-section mt-5 pt-5 pb-5 reveal" style={{ backgroundColor: 'transparent' }}>
          <div className="text-center">
            <span className="cta-label border-label mb-3">твій шлях</span>
            <h1 className="font-serif mb-5" style={{ fontSize: '3rem', color: 'var(--text-main)' }}>Стань частиною екосистеми</h1>
          </div>
          
          <div className="roles-grid">
            <div className="role-card artist">
              <div className="role-content">
                <div className="role-icon"><i className="fa-solid fa-palette"></i></div>
                <h1 style={{color: 'var(--text-main)'}}>Митець</h1>
                <p>Презентуй свої роботи світові, керуй магазином та отримуй підтримку без посередників.</p>
                <ul className="role-list">
                  <li><i className="fa-solid fa-check"></i> Прямі продажі</li>
                  <li><i className="fa-solid fa-check"></i> Персональний профіль</li>
                </ul>
                <button className="btn-role" onClick={() => navigate('/register')}>Стати митцем</button>
              </div>
            </div>

            <div className="role-card highlight">
              <div className="role-content">
                <div className="role-icon"><i className="fa-solid fa-chart-line"></i></div>
                <h1 style={{color: 'var(--text-main)'}}>Інвестор</h1>
                <p>Фінансуй перспективні проєкти, підтримуй молоді таланти та інвестуй у мистецтво.</p>
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
                <h1 style={{color: 'var(--text-main)'}}>Поціновувач</h1>
                <p>Колекціонуй унікальні роботи, підтримуй авторів та впливай на розвиток спільноти.</p>
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
    </main>
  );
}