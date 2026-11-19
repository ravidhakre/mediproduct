import { getDb } from '../_lib/firebase.js';
import { nowIso } from '../_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const orderId = String(body.orderId || '').trim();
    const result = String(body.result || '').trim(); // success | failure
    if (!orderId) return res.status(400).json({ ok: false, error: 'Missing orderId' });
    if (!['success', 'failure'].includes(result)) return res.status(400).json({ ok: false, error: 'Invalid result' });

    const db = getDb();
    const ref = db.collection('orders').doc(orderId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Order not found' });
    const data = doc.data();
    const pm = data.payment?.paymentMethod;

    if (result === 'failure') {
      await ref.update({
        status: 'payment_failed',
        'payment.paymentStatus': 'failed',
        updatedAt: nowIso(),
      });
      const updated = await ref.get();
      return res.status(200).json({ ok: true, order: { id: updated.id, ...updated.data() } });
    }

    // success
    if (pm === 'full_online') {
      await ref.update({
        status: 'confirmed',
        'payment.paymentStatus': 'paid',
        'payment.amountPaid': Number(data.payment?.totalPayable || 0),
        'payment.amountDueOnDelivery': 0,
        updatedAt: nowIso(),
      });
    } else if (pm === 'partial') {
      await ref.update({
        status: 'confirmed',
        'payment.paymentStatus': 'partial_paid',
        'payment.amountPaid': Number(data.payment?.amountToPayNow || 0),
        'payment.amountDueOnDelivery': Number(data.payment?.amountDueOnDelivery || 0),
        updatedAt: nowIso(),
      });
    } else {
      return res.status(400).json({ ok: false, error: 'This order does not require online payment completion' });
    }

    const updated = await ref.get();
    return res.status(200).json({ ok: true, order: { id: updated.id, ...updated.data() } });
  } catch (err) {
    if (err.code === 'FIREBASE_NOT_CONFIGURED') return res.status(500).json({ ok: false, error: err.message });
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Failed to update payment' });
  }
}
