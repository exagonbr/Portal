import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getInternalApiUrl } from '@/config/env';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const sessionId = cookieStore.get('session_id')?.value;

    if (!authToken) {
      return NextResponse.json(
        { valid: false, message: 'Token não encontrado' },
        { status: 401 }
      );
    }

    // Validar token e sessão com o backend
    const response = await fetch(`getInternalApiUrl('/api/auth/validate-session')`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token: authToken,
        sessionId: sessionId
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, message: 'Token ou sessão inválida' },
        { status: 401 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      valid: true,
      user: data.user,
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return NextResponse.json(
      { valid: false, message: 'Erro ao validar token' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    const cookieStore = cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token não fornecido' },
        { status: 400 }
      );
    }

    // Validar token e sessão com o backend
    const response = await fetch(`getInternalApiUrl('/api/auth/validate-session')`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        token: token,
        sessionId: sessionId
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, message: 'Token ou sessão inválida' },
        { status: 401 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      valid: true,
      user: data.user,
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return NextResponse.json(
      { valid: false, message: 'Erro ao validar token' },
      { status: 500 }
    );
  }
}