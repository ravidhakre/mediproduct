import { useEffect, useMemo, useState } from 'react';
import { api, formatINR } from '../api.js';

function Stat({ label, value }) {
  return <div className="stat"><div className="muted">{label}</div><div className="num">{value}</div></div>;
}

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { const d = await api.adminOrders(); setOrders(d.orders || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function update(id, payload) {
    setBusy(id); setError('');
    try { await api.adminUpdateOrder(id, payload); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusy(''); }
  }

  if (loading) return <div>Loading orders...</div>;
  return (
    <div className="stack">
      <div className="toolbar"><button className="btn secondary" onClick={load}>Refresh Orders</button><span className="muted">Total: {orders.length}</span></div>
      {error && <div className="notice error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th><th>Customer & Shipping</th><th>Product</th><th>Payment</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan="6" className="muted">No orders yet.</td></tr>}
            {orders.map(o => (
              <tr key={o.id}>
                <td>
                  <div style={{fontWeight:700}}>{o.orderNumber}</div>
                  <div className="muted" style={{fontSize:'.85rem'}}>{new Date(o.createdAt).toLocaleString()}</div>
                  <div className="muted" style={{fontSize:'.8rem'}}>{o.id}</div>
                </td>
                <td>
                  <div style={{fontWeight:700}}>{o.customer?.name}</div>
                  <div>{o.customer?.phone}</div>
                  {o.customer?.email && <div className="muted">{o.customer.email}</div>}
                  <div className="muted" style={{marginTop:6}}>{o.shipping?.address}, {o.shipping?.city}, {o.shipping?.state} - {o.shipping?.pincode}</div>
                </td>
                <td>
                  <div style={{fontWeight:700}}>{o.product?.name}</div>
                  <div className="muted">Base: {formatINR(o.payment?.basePrice)}</div>
                </td>
                <td>
                  <div><strong>{o.payment?.label}</strong></div>
                  <div>Total: {formatINR(o.payment?.totalPayable)}</div>
                  <div>Paid: {formatINR(o.payment?.amountPaid)} • Due: {formatINR(o.payment?.amountDueOnDelivery)}</div>
                  <div style={{marginTop:4}}><span className={`pill ${o.payment?.paymentStatus?.includes('paid') ? 'ok' : o.payment?.paymentStatus==='failed' ? 'bad':'warn'}`}>{o.payment?.paymentStatus}</span></div>
                </td>
                <td>
                  <div>Order: <strong>{o.status}</strong></div>
                  <div>Shipping: <strong>{o.shippingStatus}</strong></div>
                </td>
                <td style={{minWidth:220}}>
                  <div className="stack" style={{gap:8}}>
                    <select defaultValue={o.shippingStatus} onChange={(e)=>update(o.id, { shippingStatus: e.target.value })} disabled={busy===o.id}>
                      {['pending','packed','shipped','out_for_delivery','delivered','cancelled'].map(s=> <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select defaultValue={o.status} onChange={(e)=>update(o.id, { status: e.target.value })} disabled={busy===o.id}>
                      {['pending_payment','confirmed','payment_failed','shipped','delivered','cancelled'].map(s=> <option key={s} value={s}>{s}</option>)}
                    </select>
                    {Number(o.payment?.amountDueOnDelivery || 0) > 0 && (
                      <button className="btn secondary" style={{padding:'8px 10px'}} disabled={busy===o.id} onClick={()=>update(o.id, { markCodCollected: true })}>
                        Mark Due Amount Collected
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name:'', slug:'', subtitle:'', description:'', basePrice:'1999', comboItemsText:'Herbal Vitality Powder | 200g | Daily wellness blend\nStrength Support Capsules | 30 capsules | Convenient daily support\nEnergy Booster Tonic | 100ml | Refreshing vitality tonic', highlightsText:'Premium combo pack with multiple items\nDesigned for daily routine support\nSimple dosage and easy to use\nQuality-focused formulation' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try { const d = await api.adminProducts(); setProducts(d.products || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  function set(k,v){ setForm(f=>({...f,[k]:v})); }

  async function create(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const comboItems = form.comboItemsText.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{
        const [name, qty='', note=''] = l.split('|').map(x=> (x||'').trim());
        return { name, qty, note };
      }).filter(x=>x.name);
      const highlights = form.highlightsText.split('\n').map(l=>l.trim()).filter(Boolean);
      await api.adminCreateProduct({ ...form, basePrice: Number(form.basePrice), comboItems, highlights, active: true });
      await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    setError('');
    try { await api.adminDeleteProduct(id); await load(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="stack">
      {error && <div className="notice error">{error}</div>}
      <div className="card card-body">
        <h3 style={{fontFamily:'Manrope, sans-serif'}}>Add Combo Product</h3>
        <p className="muted">Abhi 1 active combo product storefront par dikhaya jayega (active products me se pehla). Aap naya add karke purana delete kar sakte hain.</p>
        <form onSubmit={create} className="form-grid" style={{marginTop:12}}>
          <div className="field"><label>Name *</label><input required value={form.name} onChange={e=>set('name',e.target.value)} /></div>
          <div className="field"><label>Base Price (INR) *</label><input required type="number" min="1" value={form.basePrice} onChange={e=>set('basePrice',e.target.value)} /></div>
          <div className="field"><label>Slug</label><input value={form.slug} onChange={e=>set('slug',e.target.value)} placeholder="auto if blank" /></div>
          <div className="field"><label>Subtitle</label><input value={form.subtitle} onChange={e=>set('subtitle',e.target.value)} /></div>
          <div className="field full"><label>Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} /></div>
          <div className="field full"><label>Combo Items (one per line: Name | Qty | Note)</label><textarea value={form.comboItemsText} onChange={e=>set('comboItemsText',e.target.value)} /></div>
          <div className="field full"><label>Highlights (one per line)</label><textarea value={form.highlightsText} onChange={e=>set('highlightsText',e.target.value)} /></div>
          <div className="field full"><button className="btn" disabled={saving}>{saving?'Saving...':'Add Product'}</button></div>
        </form>
      </div>

      <div className="card card-body">
        <div className="toolbar" style={{justifyContent:'space-between'}}><h3 style={{fontFamily:'Manrope, sans-serif', margin:0}}>Products</h3><button className="btn secondary" onClick={load}>Refresh</button></div>
        {loading ? <p>Loading...</p> : (
          <div className="table-wrap" style={{marginTop:12}}>
            <table>
              <thead><tr><th>Name</th><th>Base Price</th><th>Combo Items</th><th>Active</th><th>Action</th></tr></thead>
              <tbody>
                {products.length===0 && <tr><td colSpan="5" className="muted">No products found.</td></tr>}
                {products.map(p => (
                  <tr key={p.id}>
                    <td><div style={{fontWeight:700}}>{p.name}</div><div className="muted">{p.subtitle}</div></td>
                    <td>{formatINR(p.basePrice)}</td>
                    <td>{(p.comboItems||[]).length} items</td>
                    <td>{p.active ? <span className="pill ok">active</span> : <span className="pill">inactive</span>}</td>
                    <td><button className="btn secondary" style={{padding:'8px 10px'}} onClick={()=>remove(p.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [auth, setAuth] = useState(null); // null=checking, false=no, true=yes
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);

  async function check() {
    try { await api.adminMe(); setAuth(true); }
    catch { setAuth(false); }
  }
  useEffect(() => { check(); }, []);

  useEffect(() => {
    if (auth) {
      api.adminStats().then(d=>setStats(d.stats)).catch(()=>{});
    }
  }, [auth, tab]);

  async function login(e) {
    e.preventDefault(); setError('');
    try { await api.adminLogin(password); setPassword(''); setAuth(true); }
    catch (e2) { setError(e2.message || 'Login failed'); }
  }
  async function logout() {
    try { await api.adminLogout(); } catch {}
    setAuth(false); setStats(null);
  }

  if (auth === null) return <div className="section"><div className="container">Checking admin session...</div></div>;

  if (!auth) {
    return (
      <section className="section">
        <div className="container" style={{maxWidth:520}}>
          <div className="card card-body">
            <h2>Admin Login</h2>
            <p className="muted">Orders, shipping details aur products manage karne ke liye login karein.</p>
            {error && <div className="notice error" style={{marginBottom:12}}>{error}</div>}
            <form onSubmit={login} className="stack">
              <div className="field"><label>Admin Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
              <button className="btn" type="submit">Login</button>
            </form>
            <p className="muted" style={{marginTop:12, fontSize:'.9rem'}}>Password server env <code>ADMIN_PASSWORD</code> se match hota hai.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="toolbar" style={{justifyContent:'space-between', marginBottom:16}}>
          <div>
            <div className="eyebrow">Backend / Admin</div>
            <h2 style={{marginBottom:4}}>Orders & Products</h2>
            <p className="muted" style={{margin:0}}>Yahan aap total orders, shipping details aur product management dekh sakte hain.</p>
          </div>
          <div className="toolbar">
            <button className={`btn ${tab==='dashboard'?'':'secondary'}`} onClick={()=>setTab('dashboard')}>Dashboard</button>
            <button className={`btn ${tab==='orders'?'':'secondary'}`} onClick={()=>setTab('orders')}>Orders</button>
            <button className={`btn ${tab==='products'?'':'secondary'}`} onClick={()=>setTab('products')}>Products</button>
            <button className="btn secondary" onClick={logout}>Logout</button>
          </div>
        </div>

        {tab === 'dashboard' && (
          <div className="stack">
            <div className="admin-grid">
              <Stat label="Total Orders" value={stats ? stats.totalOrders : '...'} />
              <Stat label="Revenue Collected" value={stats ? formatINR(stats.revenueCollected) : '...'} />
              <Stat label="Revenue Expected (Total)" value={stats ? formatINR(stats.revenueExpected) : '...'} />
              <Stat label="Payment Methods" value={stats ? Object.keys(stats.byPaymentMethod||{}).length : '...'} />
            </div>
            <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
              <div className="card card-body">
                <h3 style={{fontFamily:'Manrope, sans-serif'}}>By Status</h3>
                {!stats ? <p className="muted">Loading...</p> : (
                  <ul style={{margin:0, paddingLeft:18}}>
                    {Object.entries(stats.byStatus||{}).map(([k,v])=> <li key={k}><strong>{k}</strong>: {v}</li>)}
                    {Object.keys(stats.byStatus||{}).length===0 && <li className="muted">No data</li>}
                  </ul>
                )}
              </div>
              <div className="card card-body">
                <h3 style={{fontFamily:'Manrope, sans-serif'}}>By Payment Method</h3>
                {!stats ? <p className="muted">Loading...</p> : (
                  <ul style={{margin:0, paddingLeft:18}}>
                    {Object.entries(stats.byPaymentMethod||{}).map(([k,v])=> <li key={k}><strong>{k}</strong>: {v}</li>)}
                    {Object.keys(stats.byPaymentMethod||{}).length===0 && <li className="muted">No data</li>}
                  </ul>
                )}
              </div>
            </div>
            <div className="notice">Tip: "Orders" tab me aap shipping details dekhkar status update kar sakte hain, aur COD/partial ka due amount collect hone par "Mark Due Amount Collected" kar sakte hain.</div>
          </div>
        )}
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'products' && <ProductsPanel />}
      </div>
    </section>
  );
}
