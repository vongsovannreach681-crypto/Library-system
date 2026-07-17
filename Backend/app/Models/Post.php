<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $appends = ['image'];

    protected $fillable = [
        'user_id',
        'content',
        'image_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        $path = $this->attributes['image_url'] ?? null;

        return $path ? asset('storage/' . ltrim($path, '/')) : null;
    }

    public function getImageAttribute(): ?string
    {
        return $this->image_url;
    }

    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }
}
