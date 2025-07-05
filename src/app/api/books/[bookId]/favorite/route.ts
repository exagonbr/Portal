import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookReadingService } from '@/services/bookReadingService';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = parseInt(params.bookId);
    const userId = BigInt(session.user.id);

    const isFavorite = await BookReadingService.isFavorite(bookId, userId);
    
    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = parseInt(params.bookId);
    const userId = BigInt(session.user.id);

    const isFavorite = await BookReadingService.toggleFavorite(bookId, userId);
    
    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
} 