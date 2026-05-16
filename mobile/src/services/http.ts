import { env } from '@/src/config/env';
import { tokenStore } from '@/src/lib/secureStore';

/** Uniform result shape (mirrors the web app's ServiceResult). */
export interface ServiceResult<T> {
  success: boolean;
  message?: string;
  body?: T;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Attach the bearer token if one is stored (default true). */
  auth?: boolean;
}

/**
 * Thin fetch wrapper: prefixes the env API base URL and attaches the JWT from
 * SecureStore as `Authorization: Bearer`. No cookies/credentials — the mobile
 * client is token-based (the web app keeps using sessions).
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ServiceResult<T>> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${env.API_BASE_URL}${path}`;
  try {
    if (__DEV__) console.log(`[api] ${method} ${url}`);
    const res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const errBody = await res.json();
        if (errBody?.message) message = errBody.message;
      } catch {
        // non-JSON error body; keep the status message
      }
      return { success: false, message };
    }

    // 204 / empty body
    if (res.status === 204) return { success: true };
    const text = await res.text();
    const parsed = text ? (JSON.parse(text) as T) : undefined;
    return { success: true, body: parsed };
  } catch (err) {
    // Network-level failure (host unreachable, cleartext blocked, etc.) — the
    // request never reached the server, so include the URL for diagnosis.
    const message = `${(err as Error).message} (${url})`;
    if (__DEV__) console.warn(`[api] request failed: ${message}`);
    return { success: false, message };
  }
}
