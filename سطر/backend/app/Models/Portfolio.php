<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $fillable = [
        'title_ar',
        'title_en',
        'description_ar',
        'description_en',
        'category',
        'image',
        'link',
        'date',
        'featured'
    ];

    protected $casts = [
        'featured' => 'boolean',
        'date' => 'date'
    ];
}
