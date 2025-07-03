import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse } from '@/config/cors';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request.headers.get('origin') || undefined);
}

// GET - Retorna um placeholder de sucesso
export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'GET /api/activity/track endpoint is active' });
}

// POST - Retorna um placeholder de sucesso
export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'POST /api/activity/track endpoint is active' });
}

// PUT - Retorna um placeholder de sucesso
export async function PUT(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'PUT /api/activity/track endpoint is active' });
}

// DELETE - Retorna um placeholder de sucesso
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'DELETE /api/activity/track endpoint is active' });
}
