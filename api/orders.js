import { getDb } from './_lib/firebase.js';
import { computePricing, PAYMENT_METHODS } from './_lib/pricing.js';
import { DEFAULT_PRODUCT, makeOrderNumber, nowIso, normalizeText, sanitizePhone, isValidPhone, isValidEmail } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const paymentMethod = String(body.paymentMethod || '').trim();
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ ok: false, error: 'Invalid payment method' });
    }

    const customer = {
      name: normalizeText(body.customer?.name, 120),
      email: normalizeText(body.customer?.email, 160).toLowerCase(),
      phone: sanitizePhone(body.customer?.phone),
    };
    const shipping = {
      address: normalizeText(body.shipping?.address, 300),
      city: normalizeText(body.shipping?.city, 80),
      state: normalizeText(body.shipping?.state, 80),
      pincode: normalizeText(body.shipping?.pincode, 12),
    };

    if (!customer.name) return res.status(400).json({ ok: false, error: 'Name is required' });
    if (!isValidPhone(customer.phone)) return res.status(400).json({ ok: false, error: 'Valid 10-digit phone number is required' });
    if (customer.email && !isValidEmail(customer.email)) return res.status(400).json({ ok: false, error: 'Invalid email address' });
    if (!shipping.address || !shipping.city || !shipping.state || !shipping.pincode) {
      return res.status(400).json({ ok: false, error: 'Complete shipping address is required' });
    }

    const db = getDb();

    let product;
    const productId = String(body.productId || '').trim();
    if (productId && productId !== 'demo-default') {
      const doc = await db.collection('products').doc(productId).get();
      if (doc.exists) product = { id: doc.id, ...doc.data() };
    }
    if (!product) {
      const snap = await db.collection('products').where('active', '==', true).limit(1).get();
      if (!snap.empty) {
        const d = snap.docs[0];
        product = { id: d.id, ...d.data() };
      } else {
        const seeded = { ...DEFAULT_PRODUCT, createdAt: nowIso(), updatedAt: nowIso() };
        const ref = await db.collection('products').add(seeded);
        product = { id: ref.id, ...seeded };
      }
    }

    const pricing = computePricing(product.basePrice, paymentMethod);
    const provider = process.env.PAYMENT_PROVIDER || 'demo';
    const orderNumber = makeOrderNumber();
    const isCod = paymentMethod === 'cod';

    const order = {
      orderNumber,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      status: isCod ? 'confirmed' : 'pending_payment',
      shippingStatus: 'pending',
      customer,
      shipping,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug || '',
        basePrice: Number(product.basePrice),
        comboItems: product.comboItems || [],
      },
      payment: {
        ...pricing,
        amountPaid: 0,
        paymentStatus: isCod ? 'cod_pending' : 'pending',
        provider: isCod ? 'cod' : provider,
      },
      notes: [],
    };

    const ref = await db.collection('orders').add(order);
    const result = { ok: true, order: { id: ref.id, ...order } };

    if (!isCod) {
      // Gateway not final: demo payment flow so end-to-end works.
      result.paymentAction = {
        provider: 'demo',
        mode: 'simulate',
        orderId: ref.id,
        amount: pricing.amountToPayNow,
        nextUrl: `/pay/demo?orderId=${encodeURIComponent(ref.id)}`,
        message: 'Payment gateway is in demo mode. Use simulate payment to complete this order.',
      };
    }

    return res.status(201).json(result);
  } catch (err) {
    if (err.code === 'FIREBASE_NOT_CONFIGURED') {
      return res.status(500).json({ ok: false, error: 'Database not configured. Please set Firebase environment variables to place orders.' });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || 'Failed to create order' });
  }
}
