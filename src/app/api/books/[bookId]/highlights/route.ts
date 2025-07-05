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

    const highlights = await BookReadingService.getHighlights(bookId, userId);
    
    return NextResponse.json({ highlights });
  } catch (error) {
    console.error('Error fetching book highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book highlights' },
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
    const body = await request.json();

    const highlight = await BookReadingService.createHighlight({
      bookId,
      userId,
      ...body
    });
    
    return NextResponse.json({ highlight });
  } catch (error) {
    console.error('Error creating book highlight:', error);
    return NextResponse.json(
      { error: 'Failed to create book highlight' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = BigInt(session.user.id);
    const { highlightId } = await request.json();

    await BookReadingService.deleteHighlight(highlightId, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book highlight:', error);
    return NextResponse.json(
      { error: 'Failed to delete book highlight' },
      { status: 500 }
    );
  }
} 