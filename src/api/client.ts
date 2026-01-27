// Core API client abstraction for VeriShelf dashboard
// - Centralizes fetch logic
// - Automatically attaches Supabase JWT
// - Handles JSON parsing and errors
// - Logs all requests and response errors for migration debugging

const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL ||
  'https://verishelf-core-api.herokuapp.com/api/v1';

interface ApiRequestOptions {
  method?: string;
  body?: any;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

// Best-effort helper to read Supabase JWT from localStorage
function getSupabaseJWT(): string | null {
  try {
    const sessionRaw =
      window.localStorage.getItem('supabase_session') ||
      window.localStorage.getItem('sb-session') ||
      '';
    if (!sessionRaw) return null;

    const session = JSON.parse(sessionRaw);
    return (
      session?.access_token ||
      session?.accessToken ||
      session?.session?.access_token ||
      null
    );
  } catch (e) {
    console.warn('[CoreAPI] Failed to read Supabase JWT from localStorage', e);
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const method = options.method || 'GET';
  const url =
    path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const jwt = getSupabaseJWT();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    signal: options.signal,
  };

  if (options.body !== undefined) {
    fetchOptions.body =
      typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);
  }

  // Log outbound request for migration debugging
  // (Safe to keep in production – low volume and very useful)
  // eslint-disable-next-line no-console
  console.log('[CoreAPI] Request:', {
    method,
    url,
    hasBody: !!fetchOptions.body,
  });

  const response = await fetch(url, fetchOptions);

  let payload: any = null;
  const text = await response.text().catch(() => '');
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    // Log response error
    // eslint-disable-next-line no-console
    console.error('[CoreAPI] Error response:', {
      method,
      url,
      status: response.status,
      payload,
    });

    const message =
      (payload && (payload.message || payload.error)) ||
      `API request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  // Log success at debug level
  // eslint-disable-next-line no-console
  console.log('[CoreAPI] Success:', {
    method,
    url,
    status: response.status,
  });

  return payload as T;
}

