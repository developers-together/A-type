const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const method = (init.method ?? 'GET').toUpperCase();
    const headers = new Headers(init.headers ?? {});

    if (method !== 'GET' && method !== 'HEAD' && !headers.has('X-CSRF-TOKEN')) {
      headers.set('X-CSRF-TOKEN', token.content);
    }

    if (!headers.has('X-Requested-With')) {
      headers.set('X-Requested-With', 'XMLHttpRequest');
    }

    return originalFetch(input, {
      ...init,
      headers,
      credentials: init.credentials ?? 'same-origin',
    });
  };
}
