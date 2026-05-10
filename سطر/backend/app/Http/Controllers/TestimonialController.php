<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index()
    {
        return response()->json(Testimonial::all());
    }

    public function store(Request $request)
    {
        $item = Testimonial::create($request->all());
        return response()->json($item, 201);
    }

    public function show(Testimonial $testimonial)
    {
        return response()->json($testimonial);
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $testimonial->update($request->all());
        return response()->json($testimonial);
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();
        return response()->json(null, 204);
    }
}
