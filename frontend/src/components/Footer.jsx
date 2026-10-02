export default function Footer() {
    return (
      <footer>
        <div className="container-footer">
          <div className="site-container">
            <div className="footer-top">
              <div className="footer-subscribe">
                <h2>Будь у курсі<br />мистецьких подій</h2>
                <p className="subscribe-text">
                  Підпишись на нашу розсилку та отримуй першим новини про виставки, нових митців та ексклюзивні пропозиції.
                </p>
                <form className="subscribe-form">
                  <input type="email" placeholder="Твій email" required />
                  <button type="submit" className="btn-subscribe">
                    Підписатися <i className="fa-solid fa-arrow-right-long ms-2"></i>
                  </button>
                </form>
              </div>
              <div className="footer-right-group">
                <div className="footer-nav">
                  <h3>НАВІГАЦІЯ</h3>
                  <div className="menu">
                    <a href="/">Головна</a>
                    <a href="/exhibition">Виставки</a>
                    <a href="/artists">Художники</a>
                    <a href="/catalog">Каталог</a>
                    <a href="/contact">Про нас</a>
                  </div>
                </div>
                <div className="footer-contacts">
                  <h3>КОНТАКТИ</h3>
                  <p>+380 (67) 345-62-77</p>
                  <p><a href="mailto:vagallery@gmail.com">vagallery@gmail.com</a></p>
                </div>
              </div>
            </div>
            <div className="logo-content">
              <p className="footer-copyright">© 2026 VA Gallery. Усі права захищені.</p>
              <div className="icons-left">
                <i className="fa-brands fa-instagram"></i>
                <i className="fa-brands fa-tiktok"></i>
                <i className="fa-brands fa-youtube"></i>
                <i className="fa-brands fa-facebook-f"></i>
                <i className="fa-brands fa-x-twitter"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }