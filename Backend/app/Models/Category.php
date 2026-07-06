<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $table = 'book_category';

    protected $fillable = [
        'name',
    ];

    public function books(): HasMany
    {
        return $this->hasMany(Books::class, 'category_id');
    }
}
