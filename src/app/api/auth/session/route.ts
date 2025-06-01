import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    // Para login do Google via NextAuth
    const session = await getServerSession();
    
    if (session) {
      return NextResponse.json(session);
    } else {
      return NextResponse.json(
        { message: 'No active session' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 