export async function fetchJson<TResponse>(
  url: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
  }

  if (method !== 'GET' && method !== 'HEAD' && !headers.has('X-CSRF-TOKEN')) {
    const token = document
      .querySelector('meta[name=\"csrf-token\"]')
      ?.getAttribute('content');

    if (token) {
      headers.set('X-CSRF-TOKEN', token);
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials ?? 'same-origin',
    });
  } catch {
    throw new Error(`Network request failed for ${url}`);
  }

  const data = (await response.json().catch(() => null)) as TResponse | null;

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return (data ?? ({} as TResponse));
}

export async function postJson<TResponse>(
  url: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  return fetchJson<TResponse>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
