import { NextResponse } from 'next/server';
import { LeaderboardEntry } from '@/types/gamification';
import { LEADERBOARD_LIMITS } from '@/constants/gamification';

// Mock database for now
let mockUserStats = new Map<string, {
  username: string;
  xp: number;
  level: number;
  recentBadges: any[];
  showOnLeaderboard: boolean;
}>();


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: Request) {
  try {
    // Filter users who opted in to leaderboard
    const leaderboardEntries: LeaderboardEntry[] = Array.from(mockUserStats.entries())
      .filter(([_, stats]) => stats.showOnLeaderboard)
      .map(([userId, stats]) => ({
        userId,
        username: stats.username,
        xp: stats.xp,
        level: stats.level,
        recentBadges: stats.recentBadges.slice(0, LEADERBOARD_LIMITS.RECENT_BADGES)
      }))
      .sort((a, b) => b.xp - a.xp) // Sort by XP descending
      .slice(0, LEADERBOARD_LIMITS.TOP_STUDENTS); // Limit to top N students

    return NextResponse.json(leaderboardEntries, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Update user's leaderboard visibility preference
export async function PUT(request: Request) {
  try {
    const { userId, showOnLeaderboard } = await request.json();

    if (!userId || typeof showOnLeaderboard !== 'boolean') {
      return NextResponse.json({ error: 'User ID and visibility preference are required' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const userStats = mockUserStats.get(userId);
    if (!userStats) {
      return NextResponse.json({ error: 'User not found' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    mockUserStats.set(userId, {
      ...userStats,
      showOnLeaderboard
    });

    return NextResponse.json({ success: true }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update leaderboard preference' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Update user stats (internal use)
export async function POST(request: Request) {
  try {
    const { userId, stats } = await request.json();

    if (!userId || !stats) {
      return NextResponse.json({ error: 'User ID and stats are required' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const existingStats = mockUserStats.get(userId);
    mockUserStats.set(userId, {
      ...existingStats,
      ...stats,
      showOnLeaderboard: existingStats?.showOnLeaderboard ?? true
    });

    return NextResponse.json({ success: true }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user stats' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}
