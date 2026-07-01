<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;

class CustomerController extends Controller
{
    /**
     * GET ALL CUSTOMERS (Pagination + Filters)
     */
    public function index(Request $request)
    {
        $query = Customer::where('user_id', auth()->id());

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('locality', 'like', "%{$search}%");
            });
        }

        // City Filter
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        // Locality Filter
        if ($request->filled('locality')) {
            $query->where('locality', $request->locality);
        }

        // Date Range Filter
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $perPage = $request->get('per_page', 10);

        $customers = $query->latest()->paginate($perPage);

        return response()->json([
            'status' => true,
            'data' => [
                'data' => CustomerResource::collection($customers),
                'meta' => [
                    'current_page' => $customers->currentPage(),
                    'last_page'    => $customers->lastPage(),
                    'total'        => $customers->total(),
                    'per_page'     => $customers->perPage(),
                ]
            ]
        ]);
    }

    /**
     * GET ALL CUSTOMERS (No Pagination) - For PDF Download
     */
    public function all(Request $request)
    {
        $query = Customer::where('user_id', auth()->id());

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('locality', 'like', "%{$search}%");
            });
        }

        // City Filter
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        // Locality Filter
        if ($request->filled('locality')) {
            $query->where('locality', $request->locality);
        }

        // Date Range Filter
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $customers = $query->latest()->get();

        return response()->json([
            'status' => true,
            'data'   => CustomerResource::collection($customers)
        ]);
    }

    /**
     * STORE NEW CUSTOMER
     */
    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create([
            'name'      => $request->name,
            'phone'     => $request->phone,
            'city'      => $request->city,
            'locality'  => $request->locality,
            'address'   => $request->address,
            'user_id'   => auth()->id()
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Customer created successfully',
            'data'    => new CustomerResource($customer)
        ], 201);
    }

    /**
     * SHOW SINGLE CUSTOMER
     */
    public function show($id)
    {
        $customer = Customer::where('user_id', auth()->id())->findOrFail($id);

        return response()->json([
            'status' => true,
            'data'   => new CustomerResource($customer)
        ]);
    }

    /**
     * UPDATE CUSTOMER
     */
    public function update(UpdateCustomerRequest $request, $id)
    {
        $customer = Customer::where('user_id', auth()->id())->findOrFail($id);

        $customer->update([
            'name'     => $request->name,
            'phone'    => $request->phone,
            'city'     => $request->city,
            'locality' => $request->locality,
            'address'  => $request->address,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Customer updated successfully',
            'data'    => new CustomerResource($customer)
        ]);
    }

    /**
     * DELETE CUSTOMER
     */
    public function destroy($id)
    {
        $customer = Customer::where('user_id', auth()->id())->findOrFail($id);
        $customer->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Customer deleted successfully'
        ]);
    }
}