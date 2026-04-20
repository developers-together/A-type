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
        host: true,
        port: 5173,
        strictPort: true,
        watch: {
            ignored: [
                '**/storage/**',
                '**/bootstrap/cache/**',
                '**/public/build/**',
                '**/public/hot',
                '**/atype',
            ],
        },
    },
});
