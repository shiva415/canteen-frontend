let adminPw = '';
export const setAdminPw = (p) => { adminPw = p; };

export const getSession = () => { try { return JSON.parse(localStorage.getItem('canteen_session')); } catch { return null; } };
export const setSession = (s) => s ? localStorage.setItem('canteen_session', JSON.stringify(s)) : localStorage.removeItem('canteen_session');

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export async function api(url, opt = {}) {
  const s = getSession();
  const headers = { 'Content-Type': 'application/json', 'x-admin': adminPw };
  if (s) headers.Authorization = 'Bearer ' + s.token;
  const fullUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `${API_BASE}${url.startsWith('/') ? url : '/' + url}`;
  const res = await fetch(fullUrl, { headers, ...opt });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401 && data.error === 'Please log in') { setSession(null); location.reload(); }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}
export const post = (url, body) => api(url, { method: 'POST', body: JSON.stringify(body) });
export const patch = (url, body) => api(url, { method: 'PATCH', body: JSON.stringify(body) });
