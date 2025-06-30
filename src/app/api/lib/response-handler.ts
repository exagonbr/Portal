import { NextResponse } from 'next/server';

interface SafeJsonResponse {
  data?: any;
  error?: string;
  isJson: boolean;
}

/**
 * Safely parse JSON response from fetch
 * @param response - The fetch response object
 * @param endpoint - The endpoint name for logging
 * @returns Object with parsed data or error information
 */
export async function safeJsonParse(
  response: Response,
  endpoint: string
): Promise<SafeJsonResponse> {
  const contentType = response.headers.get('content-type');
  
  // Log response details
  console.log(`📋 [${endpoint}] Response:`, {
    status: response.status,
    contentType,
    ok: response.ok
  });

  // Check if response is JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error(`❌ [${endpoint}] Non-JSON response:`, text.substring(0, 500));
    
    return {
      error: `Expected JSON but received ${contentType || 'unknown content type'}`,
      isJson: false
    };
  }

  try {
    const data = await response.json();
    return { data, isJson: true };
  } catch (error) {
    console.error(`❌ [${endpoint}] Failed to parse JSON:`, error);
    return {
      error: 'Failed to parse JSON response',
      isJson: false
    };
  }
}

/**
 * Handle API response and return appropriate NextResponse
 * @param response - The fetch response object
 * @param endpoint - The endpoint name for logging
 * @returns NextResponse with proper status and data/error
 */
export async function handleApiResponse(
  response: Response,
  endpoint: string
): Promise<NextResponse> {
  const { data, error, isJson } = await safeJsonParse(response, endpoint);

  // If not JSON, return error
  if (!isJson) {
    return NextResponse.json(
      {
        success: false,
        message: 'Backend returned invalid response',
        error
      },
      { status: 502 } // Bad Gateway
    );
  }

  // Return the data with original status
  return NextResponse.json(data, { status: response.status });
}
