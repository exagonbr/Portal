export interface AuthDiagnosticResult {
  success: boolean;
  issues: string[];
  timestamp: Date;
}

export const runAuthDiagnostic = async (): Promise<AuthDiagnosticResult> => {
  try {
    // Check if token exists
    const token = localStorage.getItem('accessToken');
    const issues: string[] = [];

    if (!token) {
      issues.push('No access token found in localStorage');
    }

    // Check token expiration if it exists
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          issues.push('Token is expired');
        }
      } catch (e) {
        issues.push('Failed to decode token');
      }
    }

    return {
      success: issues.length === 0,
      issues,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      success: false,
      issues: ['Failed to run auth diagnostic'],
      timestamp: new Date()
    };
  }
};
