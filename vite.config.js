import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        laravel({
            input: ['resources/css/app.css', 'resources/ts/app.tsx'],
            refresh: false,
        }),
    ],
    server: {
        host: '127.0.0.1',
        hmr: {
            host: '127.0.0.1',
        },
        watch: {
            ignored: ['**/storage/**', '**/bootstrap/cache/**', '**/public/build/**'],
        },
    },
});
