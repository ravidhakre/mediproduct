import { requireAdmin } from '../_lib/auth.js';
import { getDb } from '../_lib/firebase.js';
import { nowIso, normalizeText } from '../_lib/store.js';

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    const db = getDb();
    const id = String(req.query.id || '');

    if (req.method === 'GET') {
      if (id) {
        const doc = await db.collection('orders').doc(id).get();
        if (!doc.exists) return res.status(404).json({ ok: false, error: 'Order not found' });
        return res.status(200).json({ ok: true, order: { id: doc.id, ...doc.data() } });
      }
      const snap = await db.collection('orders').orderBy('createdAt', 'desc').limit(200).get();
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.status(200).json({ ok: true, orders });
    }

    if (req.method === 'PATCH') {
      if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const ref = db.collection('orders').doc(id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ ok: false, error: 'Order not found' });
      const data = doc.data();
      const patch = { updatedAt: nowIso() };
      if (body.shippingStatus) patch.shippingStatus = normalizeText(body.shippingStatus, 40);
      if (body.status) patch.status = normalizeText(body.status, 40);
      if (body.adminNote) {
        const notes = Array.isArray(data.notes) ? data.notes.slice() : [];
        notes.push({ at: nowIso(), text: normalizeText(body.adminNote, 500) });
        patch.notes = notes;
      }
      if (body.markCodCollected) {
        const due = Number(data.payment?.amountDueOnDelivery || 0);
        patch['payment.amountPaid'] = Number(data.payment?.amountPaid || 0) + due;
        patch['payment.amountDueOnDelivery'] = 0;
        patch['payment.paymentStatus'] = 'paid';
        if (data.status === 'confirmed' || data.status === 'shipped' || data.status === 'delivered') {
          patch.status = data.status;
        }
      }
      // Firestore doesn't support dot-path in set merge the same as update for nested in all cases via set; use update
      await ref.update(patch);
      const updated = await ref.get();
      return res.status(200).json({ ok: true, order: { id: updated.id, ...updated.data() } });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    if (err.code === 'FIREBASE_NOT_CONFIGURED') return res.status(500).json({ ok: false, error: err.message });
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Order operation failed' });
  }
}
