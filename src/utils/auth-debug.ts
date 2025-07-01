export const debugAuth = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH DEBUG] ${message}`, data || '');
  }
};

export const logAuthError = (error: any, context?: string) => {
  console.error(`[AUTH ERROR]${context ? ` ${context}:` : ''}`, error);
};

export const logAuthSuccess = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH SUCCESS] ${message}`, data || '');
  }
};
