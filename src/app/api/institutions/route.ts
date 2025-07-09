import { NextRequest, NextResponse } from 'next/server';
import { createStandardApiRoute } from '../lib/api-route-template';
import { createCorsOptionsResponse } from '@/config/cors';
import { institutionService } from '@/services/institutionService';

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/institutions',
  name: 'institutions',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const search = url.searchParams.get('search') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      const response = await institutionService.getInstitutions({
        page,
        limit,
        search
      });

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch institutions' },
        { status: 500 }
      );
    }
  }
});

// POST handler
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newInstitution = await institutionService.createInstitution(data);
    
    return NextResponse.json(newInstitution, { status: 201 });
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json(
      { error: 'Failed to create institution' },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();
    const updatedInstitution = await institutionService.updateInstitution(Number(id), data);
    
    return NextResponse.json(updatedInstitution);
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json(
      { error: 'Failed to update institution' },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    await institutionService.deleteInstitution(Number(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json(
      { error: 'Failed to delete institution' },
      { status: 500 }
    );
  }
}

// PATCH handler for toggle status
export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    const updatedInstitution = await institutionService.toggleInstitutionStatus(Number(id));
    
    return NextResponse.json(updatedInstitution);
  } catch (error) {
    console.error('Error toggling institution status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle institution status' },
      { status: 500 }
    );
  }
} 
