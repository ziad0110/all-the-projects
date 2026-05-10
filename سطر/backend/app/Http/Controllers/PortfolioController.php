<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index()
    {
        return response()->json(Portfolio::all());
    }

    public function store(Request $request)
    {
        $item = Portfolio::create($request->all());
        return response()->json($item, 201);
    }

    public function show(Portfolio $portfolio)
    {
        return response()->json($portfolio);
    }

    public function update(Request $request, Portfolio $portfolio)
    {
        $portfolio->update($request->all());
        return response()->json($portfolio);
    }

    public function destroy(Portfolio $portfolio)
    {
        $portfolio->delete();
        return response()->json(null, 204);
    }
}
