/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    workerThreads: true,
  },
  // Adicionar configuração para ignorar a pasta .next
  distDir: 'build',
  
  // Configurações de webpack para otimizar chunks e resolver problemas de carregamento
  webpack: (config, { isServer, dev }) => {
    // Resolver problema com o módulo oracledb
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        oracledb: false,
      };
    }
    
    // Apenas aplicar otimizações no cliente e em produção
    if (!isServer && !dev) {
      // Configurar timeout maior para carregamento de chunks
      config.optimization.chunkIds = 'deterministic';
      
      // Otimizar split chunks para melhor carregamento
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          // CORREÇÃO: Adicionar framer-motion como chunk específico para evitar problemas de carregamento
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 30,
            enforce: true,
            reuseExistingChunk: true,
          },
          // Criar chunks específicos para componentes críticos
          apiClient: {
            test: /[\\/]src[\\/]lib[\\/]api-client/,
            name: 'api-client',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          authServices: {
            test: /[\\/]src[\\/]services[\\/]auth/,
            name: 'auth-services',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Separar vendor chunks
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Obter o nome do pacote com verificação de segurança
              const match = module.context?.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              );
              
              if (!match || !match[1]) {
                return 'vendors';
              }
              
              const packageName = match[1];
              
              // Agrupar pacotes grandes em seus próprios chunks
              const bigPackages = ['react', 'react-dom', 'next', 'chart.js', 'antd'];
              if (bigPackages.includes(packageName)) {
                return `vendor-${packageName}`;
              }
              
              // Outros pacotes em vendor comum
              return 'vendors';
            },
            priority: 10,
          },
        },
      };
      
      // Configurar minimização para ser mais robusta
      config.optimization.minimize = true;
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach(minimizer => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: false, // Manter console logs para diagnóstico
              },
              keep_classnames: true,
              keep_fnames: true,
            };
          }
        });
      }
    }
    
    return config;
  },
}

module.exports = nextConfig 