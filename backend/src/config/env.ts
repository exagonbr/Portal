function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }
    return value;
}

export const env = {
    VAPID_EMAIL: requireEnv('VAPID_EMAIL'),
    VAPID_PUBLIC_KEY: requireEnv('VAPID_PUBLIC_KEY'),
    VAPID_PRIVATE_KEY: requireEnv('VAPID_PRIVATE_KEY'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Email configuration
    SMTP_HOST: process.env.SMTP_HOST || 'localhost',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_SECURE: process.env.SMTP_SECURE || 'false',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@portal.sabercon.com',
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://portal.sabercon.com.br',
    
    // Redis configuration
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DB: process.env.REDIS_DB || '0',
    REDIS_TLS: process.env.REDIS_TLS || 'false',
    REDIS_ENABLED: process.env.REDIS_ENABLED || 'true',
    
    // Cache configuration
    CACHE_PREFIX: process.env.CACHE_PREFIX || 'portal_cache:',
    CACHE_DEFAULT_TTL: process.env.CACHE_DEFAULT_TTL || '300',
    CACHE_WARMUP_ON_START: process.env.CACHE_WARMUP_ON_START || 'true',
    CACHE_AUTO_INVALIDATE: process.env.CACHE_AUTO_INVALIDATE || 'true'
} as const;
