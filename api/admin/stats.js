import { requireAdmin } from '../_lib/auth.js';
import { getDb } from '../_lib/firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const admin = requireAdmin(req, res);
  if (!admin) return;
  try {
    const db = getDb();
    const ordersSnap = await db.collection('orders').get();
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalOrders = orders.length;
    const byStatus = {};
    const byPaymentMethod = {};
    let revenueCollected = 0;
    let revenueExpected = 0;
    for (const o of orders) {
      byStatus[o.status || 'unknown'] = (byStatus[o.status || 'unknown'] || 0) + 1;
      const pm = o.payment?.paymentMethod || 'unknown';
      byPaymentMethod[pm] = (byPaymentMethod[pm] || 0) + 1;
      revenueCollected += Number(o.payment?.amountPaid || 0);
      revenueExpected += Number(o.payment?.totalPayable || 0);
    }
    const recent = orders
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 8);
    return res.status(200).json({ ok: true, stats: { totalOrders, byStatus, byPaymentMethod, revenueCollected, revenueExpected, recent } });
  } catch (err) {
    if (err.code === 'FIREBASE_NOT_CONFIGURED') return res.status(500).json({ ok: false, error: err.message });
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Failed to load stats' });
  }
}
