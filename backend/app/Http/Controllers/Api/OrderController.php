<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Stock;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * ===============================
     * GET ALL ORDERS
     * ===============================
     */
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'items'])
            ->where('user_id', auth()->id())
            ->latest();

        if ($request->customer_id) {
            $query->where(
                'customer_id',
                $request->customer_id
            );
        }

        $orders = $query->get();

        $result = [];

        foreach ($orders as $order) {

            foreach ($order->items as $item) {

                $result[] = [
                    'id' => $item->id,

                    'customer_name' =>
                        $order->customer->name ?? 'N/A',

                    'product_name' =>
                        $item->product_name,

                    'quantity' =>
                        $item->quantity,

                    'price' =>
                        $item->price,

                    'total' =>
                        $item->total,

                    'date' =>
                        $order->created_at
                            ->format('Y-m-d'),
                ];
            }
        }

        return response()->json([
            'status' => true,
            'data' => $result
        ]);
    }

    /**
     * ===============================
     * STORE ORDER
     * ===============================
     */
    public function store(StoreOrderRequest $request)
    {
        if (!auth()->check()) {

            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $data = $request->validated();

        DB::beginTransaction();

        try {

            $total = 0;

            // ===============================
            // CHECK STOCK
            // ===============================

            foreach ($data['items'] as $item) {

                $stock = Stock::where(
                    'product_name',
                    $item['product_name']
                )->first();

                if (!$stock) {

                    return response()->json([
                        'status' => false,
                        'message' =>
                            'Stock not found for ' .
                            $item['product_name']
                    ], 404);
                }

                if (
                    $stock->quantity <
                    $item['quantity']
                ) {

                    return response()->json([
                        'status' => false,
                        'message' =>
                            'Insufficient stock for ' .
                            $item['product_name']
                    ], 400);
                }

                $total +=
                    $item['quantity'] *
                    $item['price'];
            }

            // ===============================
            // CREATE ORDER
            // ===============================

            $order = Order::create([
                'customer_id' =>
                    $data['customer_id'],

                'user_id' =>
                    auth()->id(),

                'total_amount' =>
                    $total
            ]);

            // ===============================
            // SAVE ITEMS & REDUCE STOCK
            // ===============================

            foreach ($data['items'] as $item) {

                $itemTotal =
                    $item['quantity'] *
                    $item['price'];

                // Save item
                $order->items()->create([
                    'product_name' =>
                        $item['product_name'],

                    'quantity' =>
                        $item['quantity'],

                    'price' =>
                        $item['price'],

                    'total' =>
                        $itemTotal,
                ]);

                // Reduce stock
                $stock = Stock::where(
                    'product_name',
                    $item['product_name']
                )->first();

                $stock->quantity =
                    $stock->quantity -
                    $item['quantity'];

                $stock->save();
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' =>
                    'Order created successfully',

                'data' =>
                    new OrderResource(
                        $order->load(
                            'customer',
                            'items'
                        )
                    )
            ], 201);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Order failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ===============================
     * SHOW SINGLE ORDER
     * ===============================
     */
    public function show($id)
    {
        $order = Order::with([
                'customer',
                'items'
            ])
            ->where(
                'user_id',
                auth()->id()
            )
            ->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' =>
                new OrderResource($order)
        ]);
    }

    /**
     * ===============================
     * DELETE ORDER
     * ===============================
     */
    public function destroy($id)
    {
        $order = Order::where(
                'user_id',
                auth()->id()
            )
            ->findOrFail($id);

        $order->delete();

        return response()->json([
            'status' => true,
            'message' =>
                'Order deleted successfully'
        ]);
    }
}
