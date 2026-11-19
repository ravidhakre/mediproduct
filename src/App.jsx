import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Checkout from './pages/Checkout.jsx';
import DemoPay from './pages/DemoPay.jsx';
import Success from './pages/Success.jsx';
import Admin from './pages/Admin.jsx';

function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">MediVital<span>Combo</span></Link>
          <nav className="nav">
            <a href="/#combo">Combo</a>
            <a href="/#benefits">Benefits</a>
            <a href="/#pricing">Pricing</a>
            <Link to="/admin" className="nav-admin">Admin</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="brand footer-brand">MediVital<span>Combo</span></div>
            <p>Premium wellness combo pack. Demo storefront.</p>
          </div>
          <div className="footer-note">Secure checkout • COD • Online Payment • Partial Payment</div>
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
