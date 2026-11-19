import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../api.js';

function calc(base) {
  const b = Number(base || 0);
  return {
    full: Math.round(b * 0.95 * 100) / 100,
    cod: Math.round(b * 1.10 * 100) / 100,
    partialNow: Math.round(b * 0.10 * 100) / 100,
    partialDue: Math.round((b - Math.round(b * 0.10 * 100) / 100) * 100) / 100,
  };
}

export default function Home() {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProduct()
      .then((d) => setProduct(d.product))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const p = useMemo(() => calc(product?.basePrice || 0), [product]);

  if (loading) return <div className="section"><div className="container">Loading...</div></div>;
  if (error) return <div className="section"><div className="container notice error">{error}</div></div>;
  if (!product) return null;

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Premium Combo Pack</span>
            <h1>{product.name}</h1>
            <p className="lead">{product.subtitle || product.description}</p>
            <div className="hero-actions">
              <Link to="/checkout" className="btn">Buy Now</Link>
              <a href="#combo" className="btn secondary">See What's Inside</a>
            </div>
            <div className="price-strip">
              <div className="price-chip"><strong>Full Online:</strong> {formatINR(p.full)} <span className="muted">(5% off)</span></div>
              <div className="price-chip"><strong>COD:</strong> {formatINR(p.cod)} <span className="muted">(10% extra)</span></div>
              <div className="price-chip"><strong>Partial:</strong> {formatINR(p.partialNow)} now + {formatINR(p.partialDue)} on delivery</div>
            </div>
            <div className="hero-points">
              <div>1 Complete Combo Product</div>
              <div>Multiple Items Included</div>
              <div>COD / Online / Partial Payment</div>
              <div>Fast Shipping & Order Tracking (Admin)</div>
            </div>
          </div>
          <div className="product-visual">
            <div className="eyebrow" style={{color:'#f4ddb0'}}>Featured Combo</div>
            <div className="combo-bottle">{product.name}</div>
            <p style={{marginTop:16, color:'#e3efe8'}}>Base Price: <strong style={{color:'#fff'}}>{formatINR(product.basePrice)}</strong></p>
            <p style={{color:'#cfe0d7', marginBottom:0}}>Choose the payment option that suits you at checkout.</p>
          </div>
        </div>
      </section>

      <section id="combo" className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Inside The Combo</div>
            <h2>Multiple items in one powerful pack</h2>
            <p className="muted">{product.description}</p>
          </div>
          <div className="grid includes-grid">
            {(product.comboItems || []).map((item, i) => (
              <div key={i} className="include-item">
                <div className="qty">{item.qty}</div>
                <h3 style={{fontFamily:'Manrope, sans-serif', fontSize:'1.15rem', margin:'6px 0'}}>{item.name}</h3>
                <p className="muted" style={{margin:0}}>{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="section" style={{background:'var(--surface-alt)'}}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Why Choose This Combo</div>
            <h2>Designed for everyday confidence & wellness</h2>
          </div>
          <div className="grid benefits-grid">
            {(product.highlights && product.highlights.length ? product.highlights : [
              'Premium combo value', 'Simple daily routine', 'Quality-focused selection', 'Convenient doorstep delivery'
            ]).map((h, i) => (
              <div key={i} className="benefit">
                <h3>{h}</h3>
                <p className="muted" style={{margin:0}}>A practical, easy-to-use combo built for consistency and convenience.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Flexible Payment Options</div>
            <h2>Pay the way you prefer</h2>
            <p className="muted">Base combo price: <strong>{formatINR(product.basePrice)}</strong>. Final payable amount depends on selected payment method.</p>
          </div>
          <div className="grid pricing-grid">
            <div className="plan featured">
              <span className="badge">Save 5%</span>
              <h3 style={{marginTop:10}}>Full Online Payment</h3>
              <div className="amount">{formatINR(p.full)}</div>
              <ul>
                <li>5% discount on base price</li>
                <li>Pay complete amount now</li>
                <li>Fastest order confirmation</li>
              </ul>
            </div>
            <div className="plan">
              <h3>Cash on Delivery</h3>
              <div className="amount">{formatINR(p.cod)}</div>
              <ul>
                <li>10% COD charge added</li>
                <li>Pay full amount on delivery</li>
                <li>Convenient doorstep payment</li>
              </ul>
            </div>
            <div className="plan">
              <h3>Partial Payment</h3>
              <div className="amount">{formatINR(p.partialNow)} <span className="muted" style={{fontSize:'1rem', fontWeight:600}}>now</span></div>
              <ul>
                <li>Pay 10% advance now ({formatINR(p.partialNow)})</li>
                <li>Remaining 90% on delivery ({formatINR(p.partialDue)})</li>
                <li>Total combo price: {formatINR(product.basePrice)}</li>
              </ul>
            </div>
          </div>
          <div style={{marginTop:24}}>
            <Link to="/checkout" className="btn">Proceed to Buy Now</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{paddingTop:0}}>
        <div className="container card">
          <div className="card-body" style={{display:'flex', justifyContent:'space-between', gap:20, alignItems:'center', flexWrap:'wrap'}}>
            <div>
              <h2 style={{marginBottom:6}}>Ready to order your combo?</h2>
              <p className="muted" style={{margin:0}}>Fill shipping details, choose payment option, and place your order in minutes.</p>
            </div>
            <Link to="/checkout" className="btn">Buy Now</Link>
          </div>
        </div>
      </section>
    </>
  );
}
