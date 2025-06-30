import { NextResponse } from 'next/server';
import { BADGES } from '@/constants/gamification';
import { Badge, UserBadge } from '@/types/gamification';

// Mock database for now
let mockUserBadges = new Map<string, UserBadge[]>();


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

  const userBadges = mockUserBadges.get(userId) || [];
  return NextResponse.json(userBadges, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
}

export async function POST(request: Request) {
  try {
    const { userId, badgeId } = await request.json();

    if (!userId || !badgeId) {
      return NextResponse.json({ error: 'User ID and badge ID are required' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const userBadges = mockUserBadges.get(userId) || [];
    
    // Check if user already has this badge
    if (userBadges.some(b => b.id === badgeId)) {
      return NextResponse.json({ error: 'User already has this badge' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const newUserBadge: UserBadge = {
      ...badge,
      earnedAt: new Date()
    };

    mockUserBadges.set(userId, [...userBadges, newUserBadge]);

    return NextResponse.json(newUserBadge, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process badge award' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Endpoint to check badge progress
export async function PUT(request: Request) {
  try {
    const { userId, stats } = await request.json();

    if (!userId || !stats) {
      return NextResponse.json({ error: 'User ID and stats are required' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const userBadges = mockUserBadges.get(userId) || [];
    const earnedBadges: UserBadge[] = [];

    // Check each badge's requirements against user stats
    BADGES.forEach(badge => {
      if (userBadges.some(b => b.id === badge.id)) {
        return; // User already has this badge
      }

      let earned = false;
      switch (badge.requirement.type) {
        case 'XP':
          earned = stats.xp >= badge.requirement.threshold;
          break;
        case 'TAREFAS':
          earned = stats.completedAssignments >= badge.requirement.threshold;
          break;
        case 'PRESENÇA':
          earned = stats.attendanceDays >= badge.requirement.threshold;
          break;
        case 'CURSOS':
          earned = stats.completedCourses >= badge.requirement.threshold;
          break;
        case 'PERSONALIZADO':
          // Add custom logic here
          break;
        // Add other requirement types as needed
      }

      if (earned) {
        earnedBadges.push({
          ...badge,
          earnedAt: new Date()
        });
      }
    });

    if (earnedBadges.length > 0) {
      mockUserBadges.set(userId, [...userBadges, ...earnedBadges]);
    }

    return NextResponse.json(earnedBadges, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check badge progress' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}
