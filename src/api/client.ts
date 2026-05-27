import { API_BASE_URL } from '../config';

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
  formData?: FormData;
};

export async function apiRequest<T>(
  path: string,
  { method = 'GET', token, body, formData }: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData as unknown as BodyInit;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(url, { method, headers, body: requestBody });
  const contentType = response.headers.get('content-type') ?? '';

  let parsed: unknown = undefined;
  if (contentType.includes('application/json')) {
    try {
      parsed = await response.json();
    } catch {
      parsed = undefined;
    }
  } else {
    try {
      parsed = await response.text();
    } catch {
      parsed = undefined;
    }
  }

  if (!response.ok) {
    const message =
      (parsed as any)?.message ??
      `Request failed: ${response.status} ${response.statusText}`;
    throw new ApiError(String(message), response.status, parsed);
  }

  return parsed as T;
}

