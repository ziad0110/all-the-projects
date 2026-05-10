<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'name_ar',
        'name_en',
        'company_ar',
        'company_en',
        'text_ar',
        'text_en',
        'image',
        'rating'
    ];

    protected $casts = [
        'rating' => 'integer'
    ];
}
