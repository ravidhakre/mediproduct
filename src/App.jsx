import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Checkout from './pages/Checkout.jsx';
import DemoPay from './pages/DemoPay.jsx';
import Success from './pages/Success.jsx';
import Admin from './pages/Admin.jsx';

function Layout({ children }) {
  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="container topbar-inner">
          <span>🔥 Special Combo Offer • COD Available • 5% Off on Full Online Payment</span>
          <span className="topbar-right">Secure Checkout • Fast Shipping Support</span>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Home">
            <span className="brand-mark">PM</span>
            <span className="brand-text">Play <strong>Vitality</strong></span>
          </Link>
          <nav className="nav">
            <a href="/#combo">Combo</a>
            <a href="/#benefits">Benefits</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#reviews">Reviews</a>
            <Link to="/checkout" className="nav-cta">Buy Now</Link>
            <Link to="/admin" className="nav-admin">Admin</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="brand footer-brand"><span className="brand-mark">PM</span><span className="brand-text">Play <strong>Vitality</strong></span></div>
            <p className="footer-desc">Premium wellness combo pack crafted for daily energy, strength and confidence. Demo storefront experience with flexible payment options.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/#combo">Combo Details</a></li>
              <li><a href="/#benefits">Benefits</a></li>
              <li><a href="/#pricing">Pricing & Payment</a></li>
              <li><Link to="/checkout">Checkout</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul className="footer-links">
              <li>COD • Online • Partial Payment</li>
              <li>Order & Shipping Management (Admin)</li>
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Play Vitality Combo. Demo project.</span>
          <span>Made for Vercel + Firebase setup</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pay/demo" element={<DemoPay />} />
        <Route path="/success" element={<Success />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}
