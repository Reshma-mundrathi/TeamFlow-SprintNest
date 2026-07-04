const BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private accessToken: string | null = localStorage.getItem('sprintnest_token');
  private refreshToken: string | null = localStorage.getItem('sprintnest_refresh');

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('sprintnest_token', access);
    localStorage.setItem('sprintnest_refresh', refresh);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('sprintnest_token');
    localStorage.removeItem('sprintnest_refresh');
  }

  getTokens() {
    return { accessToken: this.accessToken, refreshToken: this.refreshToken };
  }

  async request(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${path}`;
    const headers = new Headers(options.headers || {});

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    let response = await fetch(url, config);

    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers.set('Authorization', `Bearer ${this.accessToken}`);
        response = await fetch(url, config);
      } else {
        this.clearTokens();
        window.dispatchEvent(new Event('auth_logout'));
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'API Request failed' }));
      throw new Error(errorData.message || 'API Request failed');
    }

    // Handle CSV or file downloads
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/csv')) {
      return response.text();
    }

    return response.json();
  }

  private async tryRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async get(path: string, options?: RequestInit) {
    return this.request(path, { ...options, method: 'GET' });
  }

  async post(path: string, body?: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.request(path, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  async put(path: string, body?: any, options?: RequestInit) {
    const isFormData = body instanceof FormData;
    return this.request(path, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  async delete(path: string, options?: RequestInit) {
    return this.request(path, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
