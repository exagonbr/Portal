import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);
  return NextResponse.json({ success: true, message: 'GET /api/queue/resume' }, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);
  return NextResponse.json({ success: true, message: 'POST /api/queue/resume' }, { headers: corsHeaders });
}

export async function PUT(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);
  return NextResponse.json({ success: true, message: 'PUT /api/queue/resume' }, { headers: corsHeaders });
}

export async function DELETE(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);
  return NextResponse.json({ success: true, message: 'DELETE /api/queue/resume' }, { headers: corsHeaders });
}