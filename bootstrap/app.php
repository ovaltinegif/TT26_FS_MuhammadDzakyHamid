<?php

use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Handle CORS automatically for /api/*
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Seluruh endpoint /api/* selalu menghasilkan JSON (PRD Section 12.1 & 12.4)
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Penanganan 404 untuk API
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Perangkat tidak ditemukan'
                ], 404);
            }
        });

        // Penanganan 400 untuk ValidationException bawaan
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Data tidak valid.',
                    'errors' => $e->errors()
                ], 400);
            }
        });

        // Penanganan 409 untuk Duplicate Key / UniqueConstraintViolation
        $exceptions->render(function (UniqueConstraintViolationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Kode perangkat sudah digunakan'
                ], 409);
            }
        });
    })->create();
