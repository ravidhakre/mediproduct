import { getDb } from './_lib/firebase.js';
import { sanitizePhone } from './_lib/store.js';

// Public: fetch a single order by id + phone (for confirmation/receipt view)
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const id = String(req.query.id || '').trim();
    const phone = sanitizePhone(req.query.phone || '');
    if (!id || !phone) return res.status(400).json({ ok: false, error: 'id and phone are required' });
    const db = getDb();
    const doc = await db.collection('orders').doc(id).get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Order not found' });
    const data = doc.data();
    if (sanitizePhone(data.customer?.phone) !== phone) return res.status(403).json({ ok: false, error: 'Not allowed' });
    return res.status(200).json({ ok: true, order: { id: doc.id, ...data } });
  } catch (err) {
    if (err.code === 'FIREBASE_NOT_CONFIGURED') return res.status(500).json({ ok: false, error: err.message });
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Failed to load order' });
  }
}
