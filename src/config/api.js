export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

export const AUTH_TOKEN_KEY = 'authToken';
export const CURRENT_USER_KEY = 'currentUser';

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const clearSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const apiFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearSession();
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }

  return response;
};
