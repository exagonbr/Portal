// Helper function to check if a string is valid base64
export function isValidBase64(str: string): boolean {
  // Must be a non-empty string with valid base64 characters (+ optional padding)
  if (typeof str !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(str)) {
    return false;
  }
  try {
    // Just decode it; no strict re-encode check needed
    Buffer.from(str, 'base64').toString('utf-8');
    return true;
  } catch {
    return false;
  }
}

// Helper function to check if a string contains valid JSON
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// Helper function to validate token format
export function validateTokenFormat(token: string): { isValid: boolean; error?: string } {
  // Early validation: check if token is not empty and has reasonable length
  if (!token || token.length < 10) {
    return { isValid: false, error: 'Token too short or empty' };
  }

  // Check for obviously malformed tokens (containing special characters that shouldn't be there)
  if (token.includes('�') || token.includes('\0') || token.includes('\x00')) {
    return { isValid: false, error: 'Token contains invalid characters' };
  }

  return { isValid: true };
}

// Helper function to safely decode base64 token
export function safeDecodeBase64Token(token: string): { success: boolean; data?: any; error?: string } {
  try {
    // Attempt direct base64 decode and JSON parse
    const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
    const fallbackData = JSON.parse(base64Decoded);
    
    // Check if it's a valid fallback token structure
    if (!fallbackData.userId || !fallbackData.email || !fallbackData.role) {
      return { success: false, error: 'Invalid fallback token structure' };
    }

    return { success: true, data: fallbackData };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to decode base64 token: ${errorMsg}` };
  }
}

// Helper function to log token validation errors safely
export function logTokenValidationError(jwtError: any, base64Error: any, token: string): void {
  const jwtErrorMsg = jwtError instanceof Error ? jwtError.message : String(jwtError);
  const base64ErrorMsg = base64Error instanceof Error ? base64Error.message : String(base64Error);
  
  console.warn('Token validation failed:', { 
    jwtError: jwtErrorMsg, 
    base64Error: base64ErrorMsg,
    tokenPreview: token.substring(0, 20) + '...'
  });
} 