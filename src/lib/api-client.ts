const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: any;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('medverify_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('medverify_token', token);
      } else {
        localStorage.removeItem('medverify_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('medverify_token');
    }
    return this.token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}/api/v1${cleanEndpoint}`;

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'omit',
    });

    if (res.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/verify')) {
        this.setToken(null);
        window.location.href = '/login';
      }
    }

    if (!res.ok) {
      let errData: any;
      try {
        errData = await res.json();
      } catch {
        errData = { message: res.statusText || 'An error occurred' };
      }
      throw new Error(errData.message || `HTTP ${res.status}`);
    }

    // Check if response is JSON or empty
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    return res.text() as unknown as T;
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile(file: File): Promise<{ filename: string; originalName: string; size: number; mimetype: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<{ filename: string; originalName: string; size: number; mimetype: string; url: string }>('/uploads', formData);
  }

  async downloadBlob(endpoint: string): Promise<Blob> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}/api/v1${cleanEndpoint}`;

    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to download: ${res.statusText}`);
    }

    return res.blob();
  }
}

export const api = new ApiClient();
