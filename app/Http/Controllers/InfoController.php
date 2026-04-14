<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class InfoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Info', [
            'stack' => [
                'frontend' => 'Inertia React + TypeScript + Tailwind CSS',
                'backend' => 'Laravel 13 monolith with session auth',
                'database' => 'MySQL',
                'transport' => 'Inertia forms + native fetch for JSON endpoints',
            ],
        ]);
    }
}
