<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Books extends Model
{
    protected $fillable = [
        'title',
        'author',
        'Time_spent',
        'description',
        'cover_image',
        'pdf_file',
        'star_rating',
        'review',
        'release_date',
        'category_id',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
