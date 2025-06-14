module.exports = {
  apps: [
    {
      name: 'PortalServerFrontend',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXTAUTH_URL: 'https://portal.sabercon.com.br',
        NEXT_PUBLIC_API_URL: 'https://portal.sabercon.com.br/api'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXTAUTH_URL: 'https://portal.sabercon.com.br',
        NEXT_PUBLIC_API_URL: 'https://portal.sabercon.com.br/api'
      },
      // Configurações de restart
      max_restarts: 10,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100,
      
      // Configurações de logs
      log_file: './logs/frontend-combined.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configurações de monitoramento
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Configurações de memória
      max_memory_restart: '1G',
      
      // Configurações de cluster (desabilitado para Next.js)
      instance_var: 'INSTANCE_ID',
      
      // Configurações de saúde
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true
    },
    {
      name: 'PortalServerBackend',
      script: 'npm',
      args: 'start',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Configurações de restart
      max_restarts: 10,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100,
      
      // Configurações de logs
      log_file: './logs/backend-combined.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configurações de monitoramento
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Configurações de memória
      max_memory_restart: '512M',
      
      // Configurações de cluster (pode ser habilitado para APIs)
      instance_var: 'INSTANCE_ID',
      
      // Configurações de saúde
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true
    }
  ],

  // Configurações de deploy (opcional)
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'portal.sabercon.com.br',
      ref: 'origin/master',
      repo: 'git@github.com:your-repo/portal.git',
      path: '/var/www/portal',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 