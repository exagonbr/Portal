import { NextResponse } from 'next/server';

// Mock database for now
let mockXPData = new Map();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const xpData = mockXPData.get(userId) || {
    currentXP: 0,
    level: 1,
    nextLevelXP: 100
  };

  return NextResponse.json(xpData);
}

export async function POST(request: Request) {
  try {
    const { userId, xpAmount } = await request.json();

    if (!userId || typeof xpAmount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
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

    return NextResponse.json(updatedData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process XP update' },
      { status: 500 }
    );
  }
}
