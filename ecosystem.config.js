module.exports = {
  apps: [
    {
      name: 'portal-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXTAUTH_URL: 'https://portal.sabercon.com.br',
        NEXTAUTH_SECRET: 'super_secret_nextauth_key_for_production_portal_sabercon_2025',
        GOOGLE_CLIENT_ID: '1049786491633-bfgulpbk43kkpgjaub36rhmv4v9l0m0u.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',
        TRUST_PROXY: 'true',
        BEHIND_PROXY: 'true',
        USE_SECURE_COOKIES: 'true',
        NEXT_PUBLIC_SECURE_COOKIES: 'true',
        NEXT_PUBLIC_APP_URL: 'https://portal.sabercon.com.br',
        NEXT_PUBLIC_API_URL: 'https://portal.sabercon.com.br/api',
        INTERNAL_API_URL: 'https://portal.sabercon.com.br/api',
        BACKEND_URL: 'https://portal.sabercon.com.br/api'
      }
    },
    {
      name: 'portal-backend',
      script: 'npm',
      args: 'run dev',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        GOOGLE_CLIENT_ID: '1049786491633-bfgulpbk43kkpgjaub36rhmv4v9l0m0u.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',
        GOOGLE_CALLBACK_URL: 'https://portal.sabercon.com.br/api/auth/google/callback',
        FRONTEND_URL: 'https://portal.sabercon.com.br',
        TRUST_PROXY: 'true',
        BEHIND_PROXY: 'true'
      }
    }
  ]
}; 