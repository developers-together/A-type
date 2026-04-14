<head>
    @php
        $serverTheme = auth()->check() ? auth()->user()->themePreference?->theme : '';
    @endphp
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <meta name="server-theme" content="{{ $serverTheme }}" />
    <meta name="user-authenticated" content="{{ auth()->check() ? '1' : '0' }}" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />

    <link rel="icon" type="image/x-icon" sizes="32x32" href="/assets/Logo/favicon/A-Type-Logo.ico" />

    <title>A-Type | React + Laravel Typing Platform</title>
    <meta name="description" content="A-Type typing platform built with Laravel, React, TypeScript, Tailwind, and MySQL-ready configuration." />

    <script>
        (function () {
            try {
                var storageKey = 'atype.theme';
                var savedTheme = localStorage.getItem(storageKey);
                var serverTheme = document.querySelector('meta[name="server-theme"]')?.getAttribute('content');
                var theme = savedTheme || serverTheme || 'dark';
                if (theme !== 'dark' && theme !== 'light') {
                    theme = 'dark';
                }
                document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();
    </script>

    @viteReactRefresh
    @vite('resources/ts/app.tsx')
</head>
