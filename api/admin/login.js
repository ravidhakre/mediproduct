import { createSession, setSessionCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const password = String(body.password || '');
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return res.status(500).json({ ok: false, error: 'ADMIN_PASSWORD not configured' });
    if (password !== expected) return res.status(401).json({ ok: false, error: 'Invalid password' });
    const { token, exp } = createSession();
    setSessionCookie(res, token, exp);
    return res.status(200).json({ ok: true, token, exp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Login failed' });
  }
}
