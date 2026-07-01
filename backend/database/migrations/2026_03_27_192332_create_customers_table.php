<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Safety check (duplicate error avoid)
        if (!Schema::hasTable('customers')) {

            Schema::create('customers', function (Blueprint $table) {
                $table->id();

                $table->string('name');
                $table->string('phone')->index();
                $table->text('address')->nullable();

                $table->foreignId('user_id')->constrained()->cascadeOnDelete();

                $table->timestamps();
            });

        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};