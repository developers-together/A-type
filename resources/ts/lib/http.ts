export async function fetchJson<TResponse>(
  url: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials ?? 'same-origin',
  });

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
