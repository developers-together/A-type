import React from 'react'
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true }) as Record<string, { default: ComponentType }>;
    const page = pages[`./pages/${name}.tsx`];

    if (!page) {
      throw new Error(`Inertia page not found: ${name}`);
    }

    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: {
    color: '#22c55e',
    delay: 150,
  },
});
