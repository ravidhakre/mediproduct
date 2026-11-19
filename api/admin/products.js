import { requireAdmin } from '../_lib/auth.js';
import { getDb } from '../_lib/firebase.js';
import { nowIso, normalizeText } from '../_lib/store.js';

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const db = getDb();

    if (req.method === 'GET') {
      const snap = await db.collection('products').orderBy('createdAt', 'desc').get();
      const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ ok: true, products });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const comboItems = Array.isArray(body.comboItems) ? body.comboItems.map(i => ({
        name: normalizeText(i.name, 120),
        qty: normalizeText(i.qty, 60),
        note: normalizeText(i.note, 200),
      })).filter(i => i.name) : [];
      const doc = {
        slug: normalizeText(body.slug, 120) || `product-${Date.now()}`,
        name: normalizeText(body.name, 160),
        subtitle: normalizeText(body.subtitle, 200),
        description: normalizeText(body.description, 2000),
        basePrice: Number(body.basePrice) || 0,
        currency: 'INR',
        active: body.active !== false,
        comboItems,
        highlights: Array.isArray(body.highlights) ? body.highlights.map(h => normalizeText(h, 200)).filter(Boolean) : [],
        images: Array.isArray(body.images) ? body.images.map(u => normalizeText(u, 500)).filter(Boolean) : [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      if (!doc.name || doc.basePrice <= 0) return res.status(400).json({ ok: false, error: 'Name and valid basePrice are required' });
      const ref = await db.collection('products').add(doc);
      return res.status(201).json({ ok: true, product: { id: ref.id, ...doc } });
    }

    if (req.method === 'PUT') {
      const id = String(req.query.id || '');
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const ref = db.collection('products').doc(id);
      const exists = await ref.get();
      if (!exists.exists) return res.status(404).json({ ok: false, error: 'Product not found' });
      const comboItems = Array.isArray(body.comboItems) ? body.comboItems.map(i => ({
        name: normalizeText(i.name, 120),
        qty: normalizeText(i.qty, 60),
        note: normalizeText(i.note, 200),
      })).filter(i => i.name) : exists.data().comboItems || [];
      const patch = {
        slug: normalizeText(body.slug, 120) || exists.data().slug,
        name: normalizeText(body.name, 160) || exists.data().name,
        subtitle: normalizeText(body.subtitle, 200),
        description: normalizeText(body.description, 2000),
        basePrice: Number(body.basePrice) || exists.data().basePrice,
        active: body.active !== false,
        comboItems,
        highlights: Array.isArray(body.highlights) ? body.highlights.map(h => normalizeText(h, 200)).filter(Boolean) : (exists.data().highlights || []),
        images: Array.isArray(body.images) ? body.images.map(u => normalizeText(u, 500)).filter(Boolean) : (exists.data().images || []),
        updatedAt: nowIso(),
      };
      await ref.set(patch, { merge: true });
      const updated = await ref.get();
      return res.status(200).json({ ok: true, product: { id: updated.id, ...updated.data() } });
    }

    if (req.method === 'DELETE') {
      const id = String(req.query.id || '');
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      await db.collection('products').doc(id).delete();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    if (err.code === 'FIREBASE_NOT_CONFIGURED') return res.status(500).json({ ok: false, error: err.message });
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Product operation failed' });
  }
}
