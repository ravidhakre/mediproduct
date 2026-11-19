import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatINR } from '../api.js';

function calc(base) {
  const b = Number(base || 0);
  const partialNow = Math.round(b * 0.10 * 100) / 100;
  return {
    full: Math.round(b * 0.95 * 100) / 100,
    cod: Math.round(b * 1.10 * 100) / 100,
    partialNow,
    partialDue: Math.round((b - partialNow) * 100) / 100,
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

  const comboItems = (product.comboItems && product.comboItems.length ? product.comboItems : [
    { name: 'Herbal Vitality Powder', qty: '200g', note: 'Daily wellness blend' },
    { name: 'Strength Support Capsules', qty: '30 capsules', note: 'Convenient daily support' },
    { name: 'Energy Booster Tonic', qty: '100ml', note: 'Refreshing vitality tonic' },
  ]);
  const highlights = (product.highlights && product.highlights.length ? product.highlights : [
    'Supports Daily Energy',
    'Helps Improve Stamina',
    'Strength & Confidence Support',
    'Premium Combo Value',
  ]);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Premium Men’s Wellness Combo</span>
            <h1>{product.name}</h1>
            <p className="lead">{product.subtitle || product.description}</p>
            <div className="hero-actions">
              <Link to="/checkout" className="btn">Buy Now</Link>
              <a href="#combo" className="btn secondary">View Combo Details</a>
            </div>
            <div className="hero-meta">
              <span>✓ {comboItems.length} Items in 1 Combo</span>
              <span>✓ COD Available</span>
              <span>✓ 10% Partial Payment Option</span>
              <span>✓ 5% Off on Full Online Payment</span>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-product">
              <div className="eyebrow" style={{color:'#ffd27a', marginBottom:6}}>Complete Combo Pack</div>
              <p className="hero-product-name">{product.name}</p>
              <p className="hero-product-sub">Base Price: {formatINR(product.basePrice)} • Choose your preferred payment option at checkout</p>
            </div>
            <div className="hero-price-row">
              <div className="mini-price"><div className="k">Full Online</div><div className="v">{formatINR(p.full)}</div></div>
              <div className="mini-price"><div className="k">COD Price</div><div className="v">{formatINR(p.cod)}</div></div>
              <div className="mini-price"><div className="k">Pay Now (Partial)</div><div className="v">{formatINR(p.partialNow)}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="strip">
        <div className="container strip-inner">
          <div className="strip-item">5% OFF on Full Online Payment</div>
          <div className="strip-item">COD Available (10% Extra)</div>
          <div className="strip-item">10% Advance Partial Payment</div>
          <div className="strip-item">Secure Order & Shipping Support</div>
        </div>
      </section>

      <section className="section soft" id="about">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow">About The Combo</div>
            <h2>One combo, multiple wellness essentials</h2>
            <p className="muted" style={{maxWidth:820}}>{product.description} Yeh combo un logon ke liye design kiya gaya hai jo daily routine me energy, stamina aur overall wellness ko support karna chahte hain — ek convenient pack ke saath.</p>
          </div>
          <div className="grid stats-grid">
            <div className="stat-box"><div className="num">{comboItems.length}+</div><div className="lbl">Items Inside Combo</div></div>
            <div className="stat-box"><div className="num">3</div><div className="lbl">Payment Options</div></div>
            <div className="stat-box"><div className="num">5%</div><div className="lbl">Online Discount</div></div>
            <div className="stat-box"><div className="num">10%</div><div className="lbl">Advance Partial Option</div></div>
          </div>
        </div>
      </section>

      <section id="combo" className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Inside The Combo</div>
            <h2>What you get in this pack</h2>
            <p className="muted">Combo ke andar multiple items milte hain jisse aapko ek complete value pack milta hai.</p>
          </div>
          <div className="grid includes-grid">
            {comboItems.map((item, i) => (
              <div key={i} className="include-item">
                <div className="qty">{item.qty || 'Included'}</div>
                <h3>{item.name}</h3>
                <p className="muted" style={{margin:0}}>{item.note || 'Premium combo item included for your daily routine.'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="section dark">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow">Benefits</div>
            <h2>Why choose this wellness combo?</h2>
            <p className="muted" style={{maxWidth:760}}>Play More-style premium presentation ke saath ek practical combo jo daily energy, strength aur confidence support par focus karta hai.</p>
          </div>
          <div className="grid benefits-grid">
            {highlights.map((h, i) => (
              <div key={i} className="benefit">
                <div className="icon">{String(i + 1).padStart(2, '0')}</div>
                <h3>{h}</h3>
                <p>Carefully selected combo value to support a better daily routine with simple and convenient usage.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">How To Order</div>
            <h2>Simple 3-step checkout</h2>
          </div>
          <div className="grid includes-grid">
            <div className="include-item"><div className="qty">Step 1</div><h3>Click Buy Now</h3><p className="muted" style={{margin:0}}>Landing page se Buy Now par click karein aur checkout open karein.</p></div>
            <div className="include-item"><div className="qty">Step 2</div><h3>Fill Details</h3><p className="muted" style={{margin:0}}>Apni contact aur shipping details fill karein (name, phone, address etc.).</p></div>
            <div className="include-item"><div className="qty">Step 3</div><h3>Choose Payment</h3><p className="muted" style={{margin:0}}>COD, Full Online (5% off) ya Partial (10% advance) me se option select karke order place karein.</p></div>
          </div>
        </div>
      </section>

      <section id="pricing" className="section">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow">Pricing & Payment</div>
            <h2>Flexible payment options for every customer</h2>
            <p className="muted" style={{maxWidth:760}}>Base combo price <strong>{formatINR(product.basePrice)}</strong> par pricing rules automatically apply hote hain.</p>
          </div>
          <div className="grid pricing-grid">
            <div className="plan featured">
              <div className="plan-tag">Best Value • Save 5%</div>
              <h3>Full Online Payment</h3>
              <div className="amount">{formatINR(p.full)}</div>
              <div className="sub">Pay complete amount now</div>
              <ul>
                <li>5% discount on base price</li>
                <li>Fastest order confirmation</li>
                <li>Secure online payment flow</li>
                <li>Demo gateway enabled (gateway final pending)</li>
              </ul>
            </div>
            <div className="plan">
              <h3>Cash on Delivery</h3>
              <div className="amount">{formatINR(p.cod)}</div>
              <div className="sub">Pay on delivery</div>
              <ul>
                <li>10% COD charge added</li>
                <li>Full amount collected on delivery</li>
                <li>Convenient doorstep payment</li>
                <li>Order confirmed instantly in system</li>
              </ul>
            </div>
            <div className="plan">
              <h3>Partial Payment</h3>
              <div className="amount">{formatINR(p.partialNow)}</div>
              <div className="sub">Pay 10% now + {formatINR(p.partialDue)} on delivery</div>
              <ul>
                <li>Only 10% advance online now</li>
                <li>Remaining 90% on delivery</li>
                <li>Total combo price remains {formatINR(product.basePrice)}</li>
                <li>Demo gateway enabled (gateway final pending)</li>
              </ul>
            </div>
          </div>
          <div style={{marginTop:24, textAlign:'center'}}>
            <Link to="/checkout" className="btn">Proceed to Checkout</Link>
          </div>
        </div>
      </section>

      <section id="reviews" className="section soft">
        <div className="container">
          <div className="section-head center">
            <div className="eyebrow">Customer Experience</div>
            <h2>Trusted by customers looking for a premium combo</h2>
            <p className="muted">Demo testimonials section (aap baad me real reviews/content se replace kar sakte hain).</p>
          </div>
          <div className="grid reviews-grid">
            {[
              { name: 'Rahul S.', text: 'Combo pack ka presentation aur value dono achhe lage. Checkout process simple tha aur payment options helpful hain.' },
              { name: 'Amit K.', text: 'Partial payment option kaafi convenient laga. Order details clear the aur confirmation turant mil gaya.' },
              { name: 'Vikas P.', text: 'Landing page premium feel deta hai aur product combo clearly explain kiya gaya hai. COD option bhi useful hai.' },
            ].map((r, i) => (
              <div key={i} className="review">
                <div className="stars">★★★★★</div>
                <p style={{marginBottom:10}}>{r.text}</p>
                <p className="muted" style={{margin:0, fontWeight:700}}>{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">FAQs</div>
            <h2>Common questions</h2>
          </div>
          <div className="grid faq-grid">
            <div className="faq"><h3>Payment options kaun se hain?</h3><p className="muted" style={{margin:0}}>Aap Full Online (5% discount), COD (10% extra), ya Partial Payment (10% abhi, 90% delivery par) choose kar sakte hain.</p></div>
            <div className="faq"><h3>Partial payment ka matlab kya hai?</h3><p className="muted" style={{margin:0}}>Base price ka 10% advance online pay karna hota hai, aur remaining 90% delivery ke time collect hota hai.</p></div>
            <div className="faq"><h3>Online payment gateway kaunsa hai?</h3><p className="muted" style={{margin:0}}>Gateway abhi final nahi hai, isliye demo/simulated online payment flow diya gaya hai. Real gateway baad me integrate kiya ja sakta hai.</p></div>
            <div className="faq"><h3>Order details kahan manage hongi?</h3><p className="muted" style={{margin:0}}>Admin panel me orders, shipping details, payment status aur products (add/delete) manage kar sakte hain.</p></div>
          </div>
        </div>
      </section>

      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div className="cta-banner">
            <div>
              <div className="eyebrow" style={{marginBottom:6}}>Ready to Order?</div>
              <h2 style={{marginBottom:6}}>Get your {product.name} today</h2>
              <p>Contact & shipping details fill karein, payment option choose karein, aur order place karein.</p>
            </div>
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              <Link to="/checkout" className="btn">Buy Now</Link>
              <a href="#pricing" className="btn secondary">View Pricing</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
