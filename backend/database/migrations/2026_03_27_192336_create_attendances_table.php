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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            // Relation with user (employee)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Date (important for daily tracking)
            $table->date('date')->index();

            // Login / Logout
            $table->dateTime('login_time')->nullable();
            $table->dateTime('logout_time')->nullable();

            // Total working hours
            $table->decimal('working_hours', 5, 2)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};