<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = [
        'title_ar',
        'title_en',
        'excerpt_ar',
        'excerpt_en',
        'content_ar',
        'content_en',
        'image',
        'date',
        'author_ar',
        'author_en',
        'category'
    ];

    protected $casts = [
        'date' => 'date'
    ];
}
