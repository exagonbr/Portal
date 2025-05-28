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
    NODE_ENV: process.env.NODE_ENV || 'development'
} as const;
