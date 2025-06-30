import { NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Mock database for now
let mockXPData = new Map();


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }

  const xpData = mockXPData.get(userId) || {
    currentXP: 0,
    level: 1,
    nextLevelXP: 100
  };

  return NextResponse.json(xpData, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
}

export async function POST(request: Request) {
  try {
    const { userId, xpAmount } = await request.json();

    if (!userId || typeof xpAmount !== 'number') {
      return NextResponse.json({ error: 'Invalid request body' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const currentData = mockXPData.get(userId) || {
      currentXP: 0,
      level: 1,
      nextLevelXP: 100
    };

    const newXP = currentData.currentXP + xpAmount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const nextLevelXP = newLevel * 100;

    const updatedData = {
      currentXP: newXP,
      level: newLevel,
      nextLevelXP
    };

    mockXPData.set(userId, updatedData);

    return NextResponse.json(updatedData, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process XP update' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}
