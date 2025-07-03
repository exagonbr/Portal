import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { INTERNAL_API_URL } from '@/config/env';

async function handler(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  const corsHeaders = getCorsHeaders(origin);

  const url = new URL(request.url);
  const slug = url.pathname.replace('/api/', '');
  
  // Remover a barra final da URL base, se houver
  const cleanApiUrl = INTERNAL_API_URL.endsWith('/') ? INTERNAL_API_URL.slice(0, -1) : INTERNAL_API_URL;
  const backendUrl = `${cleanApiUrl}/${slug}${url.search}`;

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        ...request.headers,
        host: 'localhost:3001',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[API Proxy Error] ${request.method} ${backendUrl}:`, error);
    return NextResponse.json(
      { success: false, message: 'Erro de proxy interno.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return createCorsOptionsResponse(origin);
}