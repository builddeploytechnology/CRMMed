<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Stock;

class StockController extends Controller
{
    // ==============================
    // GET ALL STOCK
    // ==============================

    public function index(Request $request)
    {
        $query = Stock::latest();

        // SEARCH
        if ($request->search) {

            $query->where(
                'product_name',
                'LIKE',
                '%' . $request->search . '%'
            );
        }

        $stocks = $query->get();

        return response()->json([
            'status' => true,
            'message' => 'Stock fetched successfully',
            'data' => $stocks
        ]);
    }

    // ==============================
    // STORE STOCK
    // ==============================

    public function store(Request $request)
    {
        $validated = $request->validate([

            'product_name' =>
                'required|string|max:255',

            'sku' =>
                'nullable|string|max:255',

            'quantity' =>
                'required|numeric|min:0',

            'price' =>
                'required|numeric|min:0',

            'description' =>
                'nullable|string',

            'status' =>
                'nullable|string',
        ]);

        $stock = Stock::create([

            'product_name' =>
                $validated['product_name'],

            'sku' =>
                $validated['sku'] ?? null,

            'quantity' =>
                $validated['quantity'],

            'price' =>
                $validated['price'],

            'description' =>
                $validated['description'] ?? null,

            'status' =>
                $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Stock added successfully',
            'data' => $stock
        ], 201);
    }

    // ==============================
    // SHOW SINGLE STOCK
    // ==============================

    public function show($id)
    {
        $stock = Stock::findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $stock
        ]);
    }

    // ==============================
    // UPDATE STOCK
    // ==============================

    public function update(Request $request, $id)
    {
        $stock = Stock::findOrFail($id);

        $validated = $request->validate([

            'quantity' =>
                'required|numeric|min:0',

            'price' =>
                'required|numeric|min:0',

            'status' =>
                'nullable|string',
        ]);

        $stock->update([

            'quantity' =>
                $validated['quantity'],

            'price' =>
                $validated['price'],

            'status' =>
                $validated['status']
                    ?? $stock->status,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Stock updated successfully',
            'data' => $stock
        ]);
    }

    // ==============================
    // DELETE STOCK
    // ==============================

    public function destroy($id)
    {
        $stock = Stock::findOrFail($id);

        $stock->delete();

        return response()->json([
            'status' => true,
            'message' => 'Stock deleted successfully'
        ]);
    }
}
