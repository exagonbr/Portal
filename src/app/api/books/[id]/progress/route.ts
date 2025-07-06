import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookReadingService } from '@/services/bookReadingService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = parseInt(params.id);
    const userId = BigInt(session.user.id);

    const progress = await BookReadingService.getProgress(bookId, userId);
    
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching book progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book progress' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = parseInt(params.id);
    const userId = BigInt(session.user.id);
    const body = await request.json();

    const progress = await BookReadingService.createOrUpdateProgress({
      bookId,
      userId,
      ...body
    });
    
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating book progress:', error);
    return NextResponse.json(
      { error: 'Failed to update book progress' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = parseInt(params.id);
    const userId = BigInt(session.user.id);
    const { additionalSeconds } = await request.json();

    await BookReadingService.updateReadingTime(bookId, userId, additionalSeconds);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating reading time:', error);
    return NextResponse.json(
      { error: 'Failed to update reading time' },
      { status: 500 }
    );
  }
} 