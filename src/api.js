let adminPw = '';
export const setAdminPw = (p) => { adminPw = p; };

export const getSession = () => { try { return JSON.parse(localStorage.getItem('canteen_session')); } catch { return null; } };
export const setSession = (s) => s ? localStorage.setItem('canteen_session', JSON.stringify(s)) : localStorage.removeItem('canteen_session');

export const getApiBase = () => {
  const custom = localStorage.getItem('canteen_api_url');
  if (custom) return custom.trim().replace(/\/+$/, '');
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.trim().replace(/\/+$/, '');
  return '';
};

export const setApiBase = (url) => {
  if (url && url.trim()) {
    localStorage.setItem('canteen_api_url', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('canteen_api_url');
  }
};

export async function api(url, opt = {}) {
  const s = getSession();
  const headers = { 'Content-Type': 'application/json', 'x-admin': adminPw, ...opt.headers };
  if (s) headers.Authorization = 'Bearer ' + s.token;

  const base = getApiBase();
  const fullUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : (base ? `${base}${url.startsWith('/') ? url : '/' + url}` : url);

  let res;
  try {
    res = await fetch(fullUrl, { ...opt, headers });
  } catch {
    throw new Error(
      `Cannot connect to backend server (${base || 'relative /api'}). Please verify your Backend URL.`
    );
  }

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      throw new Error('Received HTML page instead of API response. Please set the Backend URL to your canteen-backend URL.');
    }
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}): ${text.slice(0, 100)}`);
    }
    throw new Error('Backend returned an invalid empty response. Check if backend is awake.');
  }

  if (!res.ok) {
    if (res.status === 401 && data.error === 'Please log in') {
      setSession(null);
      location.reload();
    }
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const post = (url, body) => api(url, { method: 'POST', body: JSON.stringify(body) });
export const patch = (url, body) => api(url, { method: 'PATCH', body: JSON.stringify(body) });
