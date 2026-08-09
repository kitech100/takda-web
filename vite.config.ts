import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    optimizeDeps: {
        noDiscovery: true,
        holdUntilCrawlEnd: false,
        include: [
            '@inertiajs/react',
            '@laravel/passkeys/react',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            'class-variance-authority',
            'clsx',
            'input-otp',
            'laravel-echo',
            'lucide-react',
            'pusher-js',
            'react',
            'react-dom',
            'react-dom/client',
            'sonner',
            'tailwind-merge',
        ],
    },
    server: {
        host: '0.0.0.0',
        origin: process.env.VITE_ORIGIN ?? 'http://localhost:5173',
        cors: {
            origin: process.env.VITE_APP_ORIGIN ?? 'http://localhost:8080',
        },
        hmr: {
            host: process.env.VITE_HMR_HOST ?? 'localhost',
            clientPort: Number(process.env.VITE_HMR_CLIENT_PORT ?? 5173),
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
            command: process.env.WAYFINDER_COMMAND,
        }),
    ],
});
