<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'name_ar',
        'name_en',
        'role_ar',
        'role_en',
        'bio_ar',
        'bio_en',
        'image',
        'twitter',
        'linkedin',
        'github',
        'dribbble',
        'instagram'
    ];
}
