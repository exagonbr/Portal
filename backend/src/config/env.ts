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
    JWT_SECRET: requireEnv('JWT_SECRET'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Email configuration
    SMTP_HOST: process.env.SMTP_HOST || 'localhost',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_SECURE: process.env.SMTP_SECURE || 'false',
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_TLS_REJECT_UNAUTHORIZED: process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@portal.sabercon.com',
    FRONTEND_URL: 'https://portal.sabercon.com.br'
} as const;
