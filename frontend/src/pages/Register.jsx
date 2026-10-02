import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Для показу помилок

  // Функція, яка спрацьовує при натисканні "Створити акаунт"
  const handleRegister = async (e) => {
    e.preventDefault(); // Зупиняємо стандартне перезавантаження сторінки
    setErrorMsg('');

    // Збираємо всі дані з форми
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    // Перевіряємо, чи співпадають паролі
    if (userData.password !== userData.confirmPassword) {
      setErrorMsg('Паролі не співпадають!');
      return;
    }

    try {
      // ВІДПРАВЛЯЄМО ДАНІ НА НАШ БЕКЕНД
      const response = await fetch('https://vagallery-backend.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Ура! Акаунт успішно створено!');
        // Перекидаємо на сторінку входу
        navigate('/login');
      } else {
        // Якщо бекенд повернув помилку (наприклад, email вже зайнятий)
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error('Помилка запиту:', err);
      setErrorMsg('Помилка з\'єднання з сервером. Перевірте, чи запущений бекенд.');
    }
  };

  return (
    <main className="auth-page">
      <div className="reg-container">
        <div className="reg-header">
          <h1>Приєднуйся до <strong>VA</strong></h1>
          <p>Створи свій мистецький профіль за лічені секунди</p>
        </div>

        {/* Блок для показу червоної помилки, якщо вона є */}
        {errorMsg && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>{errorMsg}</div>}

        <form onSubmit={handleRegister} className="modern-form">

          <div className="input-grid">
            {/* ДОДАНО АТРИБУТИ name="..." */}
            <div className="input-group"><input type="text" name="name" placeholder="Ім'я та Прізвище" required /></div>
            <div className="input-group"><input type="email" name="email" placeholder="E-mail address" required /></div>
            <div className="input-group"><input type="tel" name="phone" placeholder="Номер телефону" required /></div>
            <div className="input-group"><input type="text" name="birthday" placeholder="ДД.ММ.РРРР" required /></div>
          </div>

          <div className="role-selection">
            <p className="section-title">Оберіть вашу роль:</p>
            <div className="role-options">
              <label className="role-item">
                <input type="radio" name="role" value="artist" required />
                <div className="role-box"><i className="fa-solid fa-palette"></i><span>Митець</span></div>
              </label>
              <label className="role-item">
                <input type="radio" name="role" value="investor" />
                <div className="role-box"><i className="fa-solid fa-chart-line"></i><span>Інвестор</span></div>
              </label>
              <label className="role-item">
                <input type="radio" name="role" value="collector" />
                <div className="role-box"><i className="fa-solid fa-heart"></i><span>Поціновувач</span></div>
              </label>
            </div>
          </div>

          <div className="input-grid">
            <div className="input-group">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Пароль" required />
            </div>
            <div className="input-group">
              <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Підтвердіть пароль" required />
            </div>
          </div>

          <div className="form-footer">
            <label className="custom-checkbox">
              <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
              Показати пароль
            </label>
          </div>

          <button className="reg-bt-modern" type="submit">Створити акаунт</button>
        </form>

        <div className="register-link">
          У вас вже є акаунт? <Link to="/login">Увійти тут</Link>
        </div>
      </div>
    </main>
  );
}