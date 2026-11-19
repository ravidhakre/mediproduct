import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatINR } from '../api.js';

function calc(base) {
  const b = Number(base || 0);
  return {
    full_online: { total: +(b * 0.95).toFixed(2), now: +(b * 0.95).toFixed(2), due: 0, label: 'Full Online Payment', note: '5% discount applied. Pay full amount now.' },
    cod: { total: +(b * 1.10).toFixed(2), now: 0, due: +(b * 1.10).toFixed(2), label: 'Cash on Delivery', note: '10% COD charge added. Pay full amount on delivery.' },
    partial: { total: +b.toFixed(2), now: +(b * 0.10).toFixed(2), due: +(b * 0.90).toFixed(2), label: 'Partial Payment', note: 'Pay 10% now and remaining 90% on delivery.' },
  };
}

export default function Checkout() {
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('full_online');
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '', pincode: ''
  });

  useEffect(() => {
    api.getProduct().then(d => setProduct(d.product)).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const prices = useMemo(() => calc(product?.basePrice || 0), [product]);
  const selected = prices[paymentMethod];

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        productId: product.id,
        paymentMethod,
        customer: { name: form.name, phone: form.phone, email: form.email },
        shipping: { address: form.address, city: form.city, state: form.state, pincode: form.pincode },
      };
      const res = await api.createOrder(payload);
      const order = res.order;
      if (paymentMethod === 'cod') {
        nav(`/success?orderId=${encodeURIComponent(order.id)}&phone=${encodeURIComponent(order.customer.phone)}`);
      } else {
        const next = res.paymentAction?.nextUrl || `/pay/demo?orderId=${encodeURIComponent(order.id)}`;
        nav(next);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="section"><div className="container">Loading checkout...</div></div>;
  if (!product) return <div className="section"><div className="container notice error">{error || 'Product not available'}</div></div>;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Checkout</div>
          <h2>Shipping & Payment Details</h2>
          <p className="muted">Fill your details and choose a payment option for <strong>{product.name}</strong>.</p>
        </div>

        {error && <div className="notice error" style={{marginBottom:16}}>{error}</div>}

        <div className="checkout-layout">
          <form className="card form-card" onSubmit={submit}>
            <h3 style={{fontFamily:'inherit'}}>Contact Details</h3>
            <div className="form-grid" style={{marginTop:12}}>
              <div className="field"><label>Full Name *</label><input required value={form.name} onChange={e=>set('name', e.target.value)} placeholder="Your full name" /></div>
              <div className="field"><label>Phone Number *</label><input required value={form.phone} onChange={e=>set('phone', e.target.value)} placeholder="10-digit mobile number" /></div>
              <div className="field full"><label>Email (optional)</label><input type="email" value={form.email} onChange={e=>set('email', e.target.value)} placeholder="you@example.com" /></div>
            </div>

            <h3 style={{fontFamily:'inherit', marginTop:22}}>Shipping Address</h3>
            <div className="form-grid" style={{marginTop:12}}>
              <div className="field full"><label>Address *</label><textarea required value={form.address} onChange={e=>set('address', e.target.value)} placeholder="House/Flat, Street, Area" /></div>
              <div className="field"><label>City *</label><input required value={form.city} onChange={e=>set('city', e.target.value)} /></div>
              <div className="field"><label>State *</label><input required value={form.state} onChange={e=>set('state', e.target.value)} /></div>
              <div className="field"><label>Pincode *</label><input required value={form.pincode} onChange={e=>set('pincode', e.target.value)} /></div>
            </div>

            <h3 style={{fontFamily:'inherit', marginTop:22}}>Payment Option</h3>
            <div className="pay-options" style={{marginTop:12}}>
              {[
                { id: 'full_online', title: 'Full Payment (Online)', desc: `Pay ${formatINR(prices.full_online.now)} now • 5% discount applied` },
                { id: 'cod', title: 'Cash on Delivery (COD)', desc: `Pay ${formatINR(prices.cod.due)} on delivery • 10% COD charge added` },
                { id: 'partial', title: 'Partial Payment (10% Advance)', desc: `Pay ${formatINR(prices.partial.now)} now + ${formatINR(prices.partial.due)} on delivery` },
              ].map(opt => (
                <label key={opt.id} className={`pay-option ${paymentMethod===opt.id ? 'active' : ''}`}>
                  <input type="radio" name="paymentMethod" checked={paymentMethod===opt.id} onChange={()=>setPaymentMethod(opt.id)} />
                  <div>
                    <div style={{fontWeight:700}}>{opt.title}</div>
                    <div className="muted" style={{fontSize:'.93rem'}}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="notice" style={{marginTop:14}}>{selected.note}</div>
            {(paymentMethod === 'full_online' || paymentMethod === 'partial') && (
              <div className="notice warn" style={{marginTop:10}}>Online payment gateway abhi final nahi hai, isliye demo payment flow use hoga (test/simulate).</div>
            )}

            <button className="btn block" type="submit" disabled={submitting} style={{marginTop:18}}>
              {submitting ? 'Placing Order...' : paymentMethod === 'cod' ? 'Place COD Order' : `Proceed to Pay ${formatINR(selected.now)}`}
            </button>
          </form>

          <aside className="card card-body" style={{position:'sticky', top:90}}>
            <h3 style={{fontFamily:'inherit'}}>Order Summary</h3>
            <p style={{fontWeight:700, marginBottom:4}}>{product.name}</p>
            <p className="muted" style={{fontSize:'.95rem'}}>Combo with {(product.comboItems||[]).length || 'multiple'} items</p>
            <div style={{marginTop:14}}>
              <div className="summary-row"><span>Base Price</span><strong>{formatINR(product.basePrice)}</strong></div>
              <div className="summary-row"><span>Payment Method</span><strong>{selected.label}</strong></div>
              {paymentMethod === 'full_online' && <div className="summary-row"><span>Discount (5%)</span><strong>- {formatINR(+(product.basePrice*0.05).toFixed(2))}</strong></div>}
              {paymentMethod === 'cod' && <div className="summary-row"><span>COD Charge (10%)</span><strong>+ {formatINR(+(product.basePrice*0.10).toFixed(2))}</strong></div>}
              <div className="summary-row total"><span>Total Payable</span><span>{formatINR(selected.total)}</span></div>
              <div className="summary-row"><span>Pay Now</span><strong>{formatINR(selected.now)}</strong></div>
              <div className="summary-row" style={{borderBottom:0}}><span>Pay on Delivery</span><strong>{formatINR(selected.due)}</strong></div>
            </div>
            <div className="notice" style={{marginTop:14, fontSize:'.92rem'}}>
              <strong>Included:</strong>
              <ul style={{margin:'8px 0 0', paddingLeft:18}}>
                {(product.comboItems||[]).slice(0,4).map((it,i)=>(<li key={i}>{it.name} {it.qty ? `(${it.qty})` : ''}</li>))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
