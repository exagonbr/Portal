import { Request, Response, NextFunction } from 'express';

// Middleware to log errors in detail
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    userAgent: req.get('User-Agent'),
    email: req.user?.email || 'anonymous',
    ip: req.ip,
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status || err.statusCode || 500
    }
  };
  
  console.log('🚨 Error occurred:', JSON.stringify(errorInfo, null, 2));
  
  // Gravar em arquivo para análise
  const fs = require('fs');
  const path = require('path');
  const logDir = path.join(__dirname, '../../logs');
  
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logPath = path.join(logDir, 'error.log');
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(errorInfo)}\n`;
    fs.appendFileSync(logPath, logEntry);
  } catch (e) {
    console.log('Erro ao escrever log:', e);
  }
  
  next(err);
}; 