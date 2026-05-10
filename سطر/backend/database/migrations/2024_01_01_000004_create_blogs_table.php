<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title_ar');
            $table->string('title_en');
            $table->text('excerpt_ar');
            $table->text('excerpt_en');
            $table->longText('content_ar');
            $table->longText('content_en');
            $table->string('image')->nullable();
            $table->date('date')->nullable();
            $table->string('author_ar');
            $table->string('author_en');
            $table->string('category');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
