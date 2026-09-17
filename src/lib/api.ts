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
      const data = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const token = data.accessToken || data.access_token;
      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('token', token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('storage'));
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
      const data = await apiFetch<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          locationCity: payload.locationCity || 'Jakarta',
        }),
      });
      const token = data.accessToken || data.access_token;
      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('token', token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('storage'));
      }
      return data;
    },
    getProfile: () => apiFetch<any>('/auth/me'),
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
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
    getAll: (params?: { customerId?: string; modderId?: string }) => {
      const query = new URLSearchParams();
      if (params?.customerId) query.append('customerId', params.customerId);
      if (params?.modderId) query.append('modderId', params.modderId);
      const qs = query.toString();
      return apiFetch<any[]>(`/orders${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => apiFetch<any>(`/orders/${id}`),
    create: (data: any) =>
      apiFetch<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiFetch<any>(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  users: {
    getAll: () => apiFetch<any[]>('/users'),
    getById: (id: string) => apiFetch<any>(`/users/${id}`),
  },
  listings: {
    getAll: () => apiFetch<any[]>('/listings'),
    getById: (id: string) => apiFetch<any>(`/listings/${id}`),
    create: (data: any) =>
      apiFetch<any>('/listings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
