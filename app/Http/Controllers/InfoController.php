<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\BuildsFrontendProps;
use Illuminate\Http\Request;

class InfoController extends Controller
{
    use BuildsFrontendProps;

    public function index(Request $request)
    {
        return $this->renderAppPage($request, 'info', [
            'stack' => [
                'backend' => 'Laravel 13 (PHP 8.3+)',
                'frontend' => 'React 19 + TypeScript',
                'ui' => 'Tailwind CSS (theme tokens + accessibility-focused palette)',
                'database' => 'MySQL (app runtime)',
                'tests' => 'Laravel feature/unit tests + manual browser smoke tests',
            ],
            'branch' => 'With-Frameworks',
            'highlights' => [
                'React-rendered pages with a shared embedded navbar (non-fixed).',
                'Profile CRUD flows, note CRUD, avatar upload, and theme persistence.',
                'Light/Dark mode with server + local sync and reusable color system.',
            ],
        ], 'Info');
    }
}
