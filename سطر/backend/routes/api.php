<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AuthController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

Route::get('/portfolio', [PortfolioController::class, 'index']);
Route::post('/portfolio', [PortfolioController::class, 'store']);
Route::get('/portfolio/{portfolio}', [PortfolioController::class, 'show']);
Route::put('/portfolio/{portfolio}', [PortfolioController::class, 'update']);
Route::delete('/portfolio/{portfolio}', [PortfolioController::class, 'destroy']);

Route::get('/team', [TeamController::class, 'index']);
Route::post('/team', [TeamController::class, 'store']);
Route::get('/team/{team}', [TeamController::class, 'show']);
Route::put('/team/{team}', [TeamController::class, 'update']);
Route::delete('/team/{team}', [TeamController::class, 'destroy']);

Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::post('/testimonials', [TestimonialController::class, 'store']);
Route::get('/testimonials/{testimonial}', [TestimonialController::class, 'show']);
Route::put('/testimonials/{testimonial}', [TestimonialController::class, 'update']);
Route::delete('/testimonials/{testimonial}', [TestimonialController::class, 'destroy']);

Route::get('/blog', [BlogController::class, 'index']);
Route::post('/blog', [BlogController::class, 'store']);
Route::get('/blog/{blog}', [BlogController::class, 'show']);
Route::put('/blog/{blog}', [BlogController::class, 'update']);
Route::delete('/blog/{blog}', [BlogController::class, 'destroy']);

Route::get('/contacts', [ContactController::class, 'index']);
Route::post('/contacts', [ContactController::class, 'store']);
Route::get('/contacts/{contact}', [ContactController::class, 'show']);
Route::put('/contacts/{contact}', [ContactController::class, 'update']);
Route::delete('/contacts/{contact}', [ContactController::class, 'destroy']);
