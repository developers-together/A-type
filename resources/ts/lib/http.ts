export type JsonResult<T> = {
  status: number;
  ok: boolean;
  data: T;
};

type HttpErrorShape = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function csrfToken(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function headers(isJson = true): Record<string, string> {
  const base: Record<string, string> = {
    'X-CSRF-TOKEN': csrfToken(),
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  };

  if (isJson) {
    base['Content-Type'] = 'application/json';
  }

  return base;
}

async function parseResponse<T>(response: Response): Promise<JsonResult<T>> {
  const data = (await response.json().catch(() => ({}))) as T;

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

export function firstErrorMessage(errorData: HttpErrorShape | undefined, fallback = 'Something went wrong.'): string {
  if (!errorData) return fallback;

  const validation = errorData.errors ? Object.values(errorData.errors).flat()[0] : null;

  return validation || errorData.message || fallback;
}

export async function getJson<T>(url: string): Promise<JsonResult<T>> {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin',
    headers: headers(false),
  });

  return parseResponse<T>(response);
}

export async function postJson<T>(url: string, payload: unknown): Promise<JsonResult<T>> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: headers(true),
    body: JSON.stringify(payload),
  });

  return parseResponse<T>(response);
}

export async function putJson<T>(url: string, payload: unknown): Promise<JsonResult<T>> {
  const response = await fetch(url, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: headers(true),
    body: JSON.stringify(payload),
  });

  return parseResponse<T>(response);
}

export async function deleteJson<T>(url: string, payload?: unknown): Promise<JsonResult<T>> {
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: headers(true),
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  return parseResponse<T>(response);
}

export async function postFormData<T>(url: string, formData: FormData): Promise<JsonResult<T>> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'X-CSRF-TOKEN': csrfToken(),
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
    body: formData,
  });

  return parseResponse<T>(response);
}
