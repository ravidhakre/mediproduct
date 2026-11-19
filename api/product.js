import { getDb } from './_lib/firebase.js';
import { DEFAULT_PRODUCT, nowIso } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const db = getDb();
    const snap = await db.collection('products').where('active', '==', true).limit(1).get();
    if (snap.empty) {
      const doc = {
        ...DEFAULT_PRODUCT,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      const ref = await db.collection('products').add(doc);
      return res.status(200).json({ ok: true, product: { id: ref.id, ...doc }, seeded: true });
    }
    const d = snap.docs[0];
    return res.status(200).json({ ok: true, product: { id: d.id, ...d.data() } });
  } catch (err) {
    if (err.code === 'FIREBASE_NOT_CONFIGURED') {
      return res.status(200).json({ ok: true, product: { id: 'demo-default', ...DEFAULT_PRODUCT }, demo: true, warning: err.message });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Failed to load product' });
  }
}
