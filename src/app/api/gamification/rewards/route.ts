import { NextResponse } from 'next/server';
import { DEFAULT_REWARDS } from '@/constants/gamification';
import { Reward } from '@/types/gamification';

// Mock database for now
let mockRewards = new Map<string, Reward[]>();
let mockClaimedRewards = new Map<string, string[]>(); // userId -> rewardIds[]

// Initialize with default rewards
mockRewards.set('system', DEFAULT_REWARDS);


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

  // Combine system rewards with teacher-created rewards
  const systemRewards = mockRewards.get('system') || [];
  const teacherRewards = Array.from(mockRewards.values())
    .flat()
    .filter(reward => reward.createdBy !== 'system');

  // Filter out expired and already claimed rewards
  const claimedRewards = mockClaimedRewards.get(userId) || [];
  const availableRewards = [...systemRewards, ...teacherRewards].filter(reward => {
    const notExpired = !reward.expiresAt || new Date(reward.expiresAt) > new Date();
    const notClaimed = !claimedRewards.includes(reward.id);
    return notExpired && notClaimed;
  });

  return NextResponse.json(availableRewards, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
}

// Create new reward (teacher only)
export async function POST(request: Request) {
  try {
    const { teacherId, reward } = await request.json();

    if (!teacherId || !reward) {
      return NextResponse.json({ error: 'Teacher ID and reward details are required' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const teacherRewards = mockRewards.get(teacherId) || [];
    const newReward: Reward = {
      ...reward,
      id: `reward_${Date.now()}`,
      createdBy: teacherId
    };

    mockRewards.set(teacherId, [...teacherRewards, newReward]);

    return NextResponse.json(newReward, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create reward' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Claim a reward
export async function PUT(request: Request) {
  try {
    const { userId, rewardId } = await request.json();

    if (!userId || !rewardId) {
      return NextResponse.json({ error: 'User ID and reward ID are required' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    // Find the reward across all sources
    const allRewards = Array.from(mockRewards.values()).flat();
    const reward = allRewards.find(r => r.id === rewardId);

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    // Check if reward is expired
    if (reward.expiresAt && new Date(reward.expiresAt) <= new Date()) {
      return NextResponse.json({ error: 'Reward has expired' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    // Check if already claimed
    const userClaims = mockClaimedRewards.get(userId) || [];
    if (userClaims.includes(rewardId)) {
      return NextResponse.json({ error: 'Reward already claimed' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    // Record the claim
    mockClaimedRewards.set(userId, [...userClaims, rewardId]);

    return NextResponse.json({ success: true, reward }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to claim reward' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Delete a reward (teacher only, for their own rewards)
export async function DELETE(request: Request) {
  try {
    const { teacherId, rewardId } = await request.json();

    if (!teacherId || !rewardId) {
      return NextResponse.json({ error: 'Teacher ID and reward ID are required' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const teacherRewards = mockRewards.get(teacherId) || [];
    const rewardIndex = teacherRewards.findIndex(r => r.id === rewardId);

    if (rewardIndex === -1) {
      return NextResponse.json({ error: 'Reward not found or unauthorized' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    teacherRewards.splice(rewardIndex, 1);
    mockRewards.set(teacherId, teacherRewards);

    return NextResponse.json({ success: true }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete reward' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}
