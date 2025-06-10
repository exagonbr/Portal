import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

// Custom token for user ID
morgan.token('user-id', (req: Request) => {
  return req.user?.email || 'anonymous';
});

// Custom token for response time in a more readable format
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for request size
morgan.token('req-size', (req: Request) => {
  return req.get('content-length') || '0';
});

// Custom format for development
export const devLogFormat = ':method :url :status :response-time ms - :res[content-length] bytes - User: :user-id';

// Custom format for production
export const prodLogFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Middleware to add response time header
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Interceptar o método json para adicionar o header antes de enviar a resposta
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', duration);
    }
    return originalJson.call(this, body);
  };
  
  // Interceptar o método send para adicionar o header antes de enviar a resposta
  const originalSend = res.send;
  res.send = function(body: any) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', duration);
    }
    return originalSend.call(this, body);
  };
  
  next();
};

// Middleware to log slow requests
export const slowRequestLogger = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > threshold) {
        console.warn(`🐌 Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms - User: ${req.user?.userId || 'anonymous'}`);
      }
    });
    
    next();
  };
};

// Middleware to log errors in detail
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    email: req.user?.email || 'anonymous',
    ip: req.ip,
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status || err.statusCode || 500
    }
  };
  
  console.error('🚨 Error occurred:', JSON.stringify(errorInfo, null, 2));
  next(err);
};

// Middleware to log duplicate requests
export const duplicateRequestLogger = () => {
  const requestCounts = new Map<string, { count: number; lastSeen: number }>();
  
  // Clean up old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(requestCounts.entries());
    for (const [key, value] of entries) {
      if (now - value.lastSeen > 300000) { // 5 minutes
        requestCounts.delete(key);
      }
    }
  }, 300000);
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.method}:${req.originalUrl}:${req.user?.userId || req.ip}`;
    const now = Date.now();
    const existing = requestCounts.get(key);
    
    if (existing) {
      existing.count++;
      existing.lastSeen = now;
      
      // Log if there are many duplicate requests in a short time
      if (existing.count > 5 && (now - existing.lastSeen) < 10000) { // 10 seconds
        console.warn(`🔄 Duplicate request detected: ${req.method} ${req.originalUrl} (${existing.count} times) - User: ${req.user?.userId || 'anonymous'}`);
      }
    } else {
      requestCounts.set(key, { count: 1, lastSeen: now });
    }
    
    next();
  };
}; 