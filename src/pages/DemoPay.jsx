import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api, formatINR } from '../api.js';

export default function DemoPay() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const orderId = params.get('orderId') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amountHint, setAmountHint] = useState(null);

  // Try to fetch order amount for display (needs phone not known here; we'll show generic and also allow fetching after? simpler: store phone in sessionStorage from checkout isn't done - but we can ask user to go back; alternatively demo-complete doesn't need phone and success page does.)
  // We'll just show actions; amount will be reflected on success page.

  async function complete(result) {
    if (!orderId) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.demoComplete({ orderId, result });
      const order = res.order;
      const phone = order?.customer?.phone || '';
      nav(`/success?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}&pay=${result}`);
    } catch (e) {
      setError(e.message || 'Payment update failed');
    } finally {
      setLoading(false);
    }
  }

  if (!orderId) {
    return <div className="section"><div className="container notice error">Missing order ID. <Link to="/checkout">Go to checkout</Link></div></div>;
  }

  return (
    <section className="section">
      <div className="container" style={{maxWidth:720}}>
        <div className="card card-body">
          <span className="badge">Demo Payment Gateway</span>
          <h2 style={{marginTop:12}}>Complete Online Payment (Demo)</h2>
          <p className="muted">Payment gateway abhi final nahi hai. Is demo screen se aap payment <strong>Success</strong> ya <strong>Failure</strong> simulate kar sakte hain, taaki full checkout flow test ho sake.</p>
          <div className="notice warn" style={{margin:'14px 0'}}>
            Order ID: <strong>{orderId}</strong><br/>
            Real gateway integrate hone ke baad yahi step Razorpay/selected gateway checkout se replace ho jayega.
          </div>
          {error && <div className="notice error" style={{marginBottom:12}}>{error}</div>}
          <div className="toolbar" style={{marginTop:8}}>
            <button className="btn" disabled={loading} onClick={() => complete('success')}>{loading ? 'Processing...' : 'Simulate Payment Success'}</button>
            <button className="btn secondary" disabled={loading} onClick={() => complete('failure')}>Simulate Payment Failure</button>
            <Link to="/" className="btn secondary">Cancel</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
