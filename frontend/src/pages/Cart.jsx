import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/Cart.css';

const categoryNames = { abstract: 'Абстракція', modern: 'Модерн / Сучасне мистецтво', renaissance: 'Ренесанс / Класика', portrait: 'Портрет', landscape: 'Пейзаж', graphics: 'Графіка', sculpture: 'Скульптура' };

export default function Cart() {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const [isSuccess, setIsSuccess] = useState(false);

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;

  const totalPrice = cartItems.reduce((sum, item) => {
    const numericPrice = typeof item.price === 'string' ? parseInt(item.price.replace(/\s/g, '')) : Number(item.price);
    return sum + (numericPrice || 0);
  }, 0);

  const handleCheckout = (e) => {
    e.preventDefault(); 
    if (!currentUser) return alert('Увійдіть в акаунт!');

    // МАГІЯ: Прив'язуємо куплені картини до конкретного ID поточного юзера!
    const collectionKey = `my_collection_${currentUser.id}`;
    const existingPurchases = JSON.parse(localStorage.getItem(collectionKey)) || [];
    const updatedCollection = [...existingPurchases, ...cartItems];
    localStorage.setItem(collectionKey, JSON.stringify(updatedCollection));

    clearCart(); 
    setIsSuccess(true); 
  };

  return (
    <main className="cart-page-wrapper">
      <section className="site-container">
        <div className="page-header-block mb-4">
          <h1 className="font-serif">Кошик</h1>
        </div>

        {isSuccess ? (
          <div className="empty-state-box" style={{ background: '#fff' }}>
            <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>
            <h3>Оплата пройшла успішно!</h3>
            <p>Дякуємо за підтримку українського мистецтва. Деталі замовлення надіслані на ваш email.</p>
            <Link to="/catalog" className="btn-dash-primary mt-4" style={{ display: 'inline-block', textDecoration: 'none' }}>Повернутися до каталогу</Link>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-state-box">
            <i className="fa-solid fa-basket-shopping"></i>
            <h3>Ваш кошик порожній</h3>
            <p>Здається, ви ще не обрали жодної картини.</p>
            <Link to="/catalog" className="btn-dash-primary mt-4" style={{ display: 'inline-block', textDecoration: 'none' }}>Перейти до каталогу</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div className="cart-item-card" key={item.id}>
                  <img src={item.image_url} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h3>{item.title}</h3>
                    <p>Автор: {item.artist_name}</p> 
                    <p style={{ marginTop: '10px' }}>
                      <span className="style-badge" style={{ position:'static', border:'1px solid #cbd5e0' }}>
                        {categoryNames[item.category] || item.category}
                      </span>
                    </p>
                  </div>
                  <div className="cart-item-price">{item.price} ₴</div>
                  <button className="btn-remove-item" title="Видалити з кошика" onClick={() => removeFromCart(item.id)}><i className="fa-solid fa-trash"></i></button>
                </div>
              ))}
            </div>

            <div className="cart-summary-box">
              <h3 className="summary-title">Оформлення замовлення</h3>
              <div className="summary-row"><span>Кількість товарів:</span><span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cartItems.length} шт.</span></div>
              <div className="summary-row"><span>Доставка:</span><span style={{ fontWeight: 700, color: '#10b981' }}>Безкоштовно</span></div>
              <div className="summary-total"><span>Разом:</span><span>{totalPrice.toLocaleString('uk-UA')} ₴</span></div>

              <form className="checkout-form" onSubmit={handleCheckout}>
                <label>ПІБ Отримувача</label><input type="text" placeholder="Іван Іваненко" required />
                <label>Відділення Нової Пошти</label><input type="text" placeholder="м. Київ, Відділення №1" required />
                <label>Номер картки</label><input type="text" placeholder="хххх хххх хххх хххх" maxLength="19" required />
                <button type="submit" className="btn-pay">Оплатити замовлення</button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}