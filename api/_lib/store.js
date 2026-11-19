export const DEFAULT_PRODUCT = {
  slug: 'vitality-combo-pack',
  name: 'Vitality Combo Pack',
  subtitle: 'Complete daily wellness combo with multiple premium items',
  description: 'A carefully curated combo pack designed to support energy, strength and everyday wellness. Includes multiple complementary items in one value pack.',
  basePrice: 1999,
  currency: 'INR',
  active: true,
  comboItems: [
    { name: 'Herbal Vitality Powder', qty: '200g', note: 'Daily wellness blend' },
    { name: 'Strength Support Capsules', qty: '30 capsules', note: 'Convenient daily support' },
    { name: 'Energy Booster Tonic', qty: '100ml', note: 'Refreshing vitality tonic' },
  ],
  highlights: [
    'Premium combo pack with multiple items',
    'Designed for daily routine support',
    'Simple dosage and easy to use',
    'Quality-focused formulation',
  ],
  images: [],
  createdAt: null,
  updatedAt: null,
};

export function nowIso() {
  return new Date().toISOString();
}

export function makeOrderNumber() {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MP${y}${m}${day}${rand}`;
}

export function sanitizePhone(v) {
  return String(v || '').replace(/\D/g, '').slice(-10);
}

export function isValidPhone(v) {
  return /^[6-9]\d{9}$/.test(sanitizePhone(v));
}

export function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

export function normalizeText(v, max = 500) {
  return String(v || '').trim().slice(0, max);
}
