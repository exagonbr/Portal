/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas
  reactStrictMode: true,
  swcMinify: true,
  
  // Configurações experimentais para resolver problemas de módulos
  experimental: {
    serverComponentsExternalPackages: [
      'oracledb',
      'mysql',
      'mysql2', 
      'sqlite3',
      'better-sqlite3',
      'tedious',
      'pg-native',
      'sharp',
      'knex'
    ],
  },

  // Configuração do Webpack para resolver o problema do oracledb
  webpack: (config, { isServer }) => {
    // Configurações específicas para servidor
    if (isServer) {
      // Marcar drivers de banco como externos
      config.externals.push(
        'oracledb', 
        'mysql', 
        'mysql2', 
        'sqlite3', 
        'better-sqlite3', 
        'tedious', 
        'pg-native'
      );
    } else {
      // Fallbacks para o cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'oracledb': false,
        'mysql': false,
        'mysql2': false,
        'sqlite3': false,
        'better-sqlite3': false,
        'tedious': false,
        'pg-native': false,
      };
    }

    // Plugins para ignorar módulos problemáticos
    const webpack = require('webpack');
    config.plugins.push(
      // Ignorar drivers de banco específicos do Knex
      new webpack.IgnorePlugin({
        resourceRegExp: /^oracledb$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^mysql$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^mysql2$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^sqlite3$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^better-sqlite3$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^tedious$/,
        contextRegExp: /knex/,
      })
    );

    return config;
  },
};

module.exports = nextConfig; 