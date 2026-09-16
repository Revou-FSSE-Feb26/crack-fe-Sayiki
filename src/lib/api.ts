// Centralized SwitchLab API Client for communicating with NestJS backend

const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://crack-be-sayiki.onrender.com');

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  
  // Get token from localStorage if in browser and not explicitly passed
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const data = await apiFetch<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    },
    register: async (payload: {
      name: string;
      email: string;
      password: string;
      role: 'CUSTOMER' | 'MODDER';
      locationCity?: string;
    }) => {
      const data = await apiFetch<{ accessToken: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          locationCity: payload.locationCity || 'Jakarta',
        }),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    },
    getProfile: () => apiFetch<any>('/auth/me'),
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  },
  modders: {
    getAll: () => apiFetch<any[]>('/modders'),
    getById: (id: string) => apiFetch<any>(`/modders/${id}`),
  },
  products: {
    getAll: () => apiFetch<any[]>('/products'),
    getById: (id: string) => apiFetch<any>(`/products/${id}`),
  },
  orders: {
    getAll: () => apiFetch<any[]>('/orders'),
    getById: (id: string) => apiFetch<any>(`/orders/${id}`),
  },
};
