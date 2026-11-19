import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, formatINR } from '../api.js';

export default function Success() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || '';
  const phone = params.get('phone') || '';
  const pay = params.get('pay');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !phone) { setLoading(false); setError('Order details missing.'); return; }
    api.getOrder(orderId, phone).then(d => setOrder(d.order)).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [orderId, phone]);

  if (loading) return <div className="section"><div className="container">Loading order...</div></div>;

  return (
    <section className="section">
      <div className="container" style={{maxWidth:820}}>
        {error ? (
          <div className="notice error">{error}</div>
        ) : !order ? null : (
          <div className="card card-body">
            {order.status === 'payment_failed' ? (
              <>
                <span className="badge" style={{background:'#fef2f2', color:'#991b1b'}}>Payment Failed</span>
                <h2 style={{marginTop:12}}>Payment could not be completed</h2>
                <p className="muted">Aapka order create hua tha, lekin online payment fail ho gaya. Aap checkout par wapas jaakar dobara try kar sakte hain.</p>
              </>
            ) : (
              <>
                <span className="badge" style={{background:'#ecfdf3', color:'#067647'}}>Order Placed</span>
                <h2 style={{marginTop:12}}>Thank you! Your order is confirmed.</h2>
                <p className="muted">Order Number: <strong>{order.orderNumber}</strong></p>
              </>
            )}

            <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', marginTop:18}}>
              <div className="notice"><strong>Status</strong><br/>{order.status}</div>
              <div className="notice"><strong>Shipping Status</strong><br/>{order.shippingStatus}</div>
              <div className="notice"><strong>Payment Method</strong><br/>{order.payment?.label || order.payment?.paymentMethod}</div>
              <div className="notice"><strong>Payment Status</strong><br/>{order.payment?.paymentStatus}</div>
            </div>

            <div className="card" style={{marginTop:18, boxShadow:'none'}}>
              <div className="card-body">
                <h3 style={{fontFamily:'inherit'}}>Payment Summary</h3>
                <div className="summary-row"><span>Product</span><strong>{order.product?.name}</strong></div>
                <div className="summary-row"><span>Base Price</span><strong>{formatINR(order.payment?.basePrice)}</strong></div>
                <div className="summary-row"><span>Total Payable</span><strong>{formatINR(order.payment?.totalPayable)}</strong></div>
                <div className="summary-row"><span>Paid Now</span><strong>{formatINR(order.payment?.amountPaid)}</strong></div>
                <div className="summary-row" style={{borderBottom:0}}><span>Due on Delivery</span><strong>{formatINR(order.payment?.amountDueOnDelivery)}</strong></div>
              </div>
            </div>

            <div className="card" style={{marginTop:14, boxShadow:'none'}}>
              <div className="card-body">
                <h3 style={{fontFamily:'inherit'}}>Shipping Details</h3>
                <p style={{marginBottom:4}}><strong>{order.customer?.name}</strong> • {order.customer?.phone}{order.customer?.email ? ` • ${order.customer.email}` : ''}</p>
                <p className="muted" style={{margin:0}}>{order.shipping?.address}, {order.shipping?.city}, {order.shipping?.state} - {order.shipping?.pincode}</p>
              </div>
            </div>

            <div className="toolbar" style={{marginTop:18}}>
              <Link to="/" className="btn secondary">Back to Home</Link>
              {order.status === 'payment_failed' && <Link to="/checkout" className="btn">Try Again</Link>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
