import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      // Стукаємо на наш бекенд
      const response = await fetch('https://vagallery-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ЗБЕРІГАЄМО ДАНІ КОРИСТУВАЧА В БРАУЗЕР
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Переходимо в кабінет
        navigate('/account');
      } else {
        setErrorMsg(data.message); // "Неправильний пароль" тощо
      }
    } catch (err) {
      console.error('Помилка входу:', err);
      setErrorMsg('Помилка з\'єднання з сервером.');
    }
  };

  return (
    <main className="auth-page">
      <div className="login-container">
        <div className="reg-header">
          <h1>З поверненням до <strong>VA</strong></h1>
          <p>Увійдіть, щоб продовжити свою мистецьку подорож</p>
        </div>

        {errorMsg && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>{errorMsg}</div>}

        <form onSubmit={handleLogin} className="modern-form">
          <div className="input-stack">
            <div className="input-group">
              <input type="email" name="email" placeholder="E-mail" required />
            </div>
            <div className="input-group">
              <input type="password" name="password" placeholder="Пароль" required />
            </div>
          </div>

          <div className="form-footer">
            <label className="custom-checkbox">
              <input type="checkbox" /> Запам'ятати мене
            </label>
          </div>

          <button className="log-bt-modern" type="submit">Увійти</button>
        </form>

        <div className="register-link">
          У вас ще немає акаунта? <Link to="/register">Зареєструватися</Link>
        </div>
      </div>
    </main>
  );
}