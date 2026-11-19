async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok || data.ok === false) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  getProduct: () => request('/api/product'),
  createOrder: (payload) => request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id, phone) => request(`/api/order?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`),
  demoComplete: (payload) => request('/api/payment/demo-complete', { method: 'POST', body: JSON.stringify(payload) }),

  adminLogin: (password) => request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  adminLogout: () => request('/api/admin/logout', { method: 'POST' }),
  adminMe: () => request('/api/admin/me'),
  adminStats: () => request('/api/admin/stats'),
  adminOrders: () => request('/api/admin/orders'),
  adminOrder: (id) => request(`/api/admin/orders?id=${encodeURIComponent(id)}`),
  adminUpdateOrder: (id, payload) => request(`/api/admin/orders?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  adminProducts: () => request('/api/admin/products'),
  adminCreateProduct: (payload) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateProduct: (id, payload) => request(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adminDeleteProduct: (id) => request(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export function formatINR(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
}
