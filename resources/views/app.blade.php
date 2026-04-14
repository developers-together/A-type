<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />

    <title inertia>{{ config('app.name', 'A-Type') }}</title>

    @vite(['resources/css/app.css', 'resources/ts/app.tsx'])
    @inertiaHead
</head>
<body class="h-full bg-slate-950 text-slate-100 antialiased">
    @inertia
</body>
</html>
