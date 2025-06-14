/**
 * Utilitário para fazer requisições HTTP com bypass SSL em desenvolvimento
 */

interface HttpClientOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  bypassSSL?: boolean;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  bypassSSL?: boolean;
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private bypassSSL: boolean;

  constructor(options: HttpClientOptions = {}) {
    this.baseURL = options.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.timeout = options.timeout || 30000;
    this.bypassSSL = options.bypassSSL ?? process.env.NODE_ENV === 'development';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
  }

  private async makeRequest(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const url = this.buildURL(endpoint);
    const method = options.method || 'GET';
    
    // Configurar headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers
    };

    // Configurar body
    const body = options.body ? JSON.stringify(options.body) : undefined;

    // Configurar fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      body,
      // Em desenvolvimento, permitir conexões inseguras
      ...(this.bypassSSL && {
        // @ts-ignore - propriedade específica para Node.js
        agent: false,
        // @ts-ignore - bypass SSL em desenvolvimento
        rejectUnauthorized: false
      })
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        // Se for erro SSL em desenvolvimento, tentar com HTTP
        if (this.bypassSSL && error.message.includes('SSL') && url.startsWith('https://')) {
          const httpUrl = url.replace('https://', 'http://');
          console.warn(`Tentando conexão HTTP devido a erro SSL: ${httpUrl}`);
          
          return this.makeRequest(endpoint.replace(this.baseURL, httpUrl.replace('/api', '')), options);
        }
      }
      throw error;
    }
  }

  private buildURL(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  // Métodos públicos
  async get(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'POST', body: data });
  }

  async put(endpoint: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'PUT', body: data });
  }

  async delete(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'DELETE' });
  }

  async patch(endpoint: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'PATCH', body: data });
  }
}

// Instância padrão
export const httpClient = new HttpClient({
  bypassSSL: process.env.NODE_ENV === 'development'
});

// Função utilitária para fazer bypass SSL em desenvolvimento
export const createHttpClient = (options: HttpClientOptions = {}) => {
  return new HttpClient({
    bypassSSL: process.env.NODE_ENV === 'development',
    ...options
  });
};

// Função para verificar se a URL é HTTP ou HTTPS
export const isHttpsUrl = (url: string): boolean => {
  return url.startsWith('https://');
};

// Função para converter HTTPS para HTTP em desenvolvimento
export const forceHttpInDev = (url: string): string => {
  if (process.env.NODE_ENV === 'development' && url.startsWith('https://')) {
    return url.replace('https://', 'http://');
  }
  return url;
}; 