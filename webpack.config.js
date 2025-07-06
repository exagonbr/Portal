const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      // Desabilitar módulos Node.js no cliente
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      // Desabilitar drivers de banco no cliente
      'pg': false,
      'pg-native': false,
      'pg-query-stream': false,
      'oracledb': false,
      'mysql': false,
      'mysql2': false,
      'sqlite3': false,
      'better-sqlite3': false,
      'tedious': false,
    },
  },
  plugins: [
    // Ignorar módulos problemáticos
    new webpack.IgnorePlugin({
      resourceRegExp: /^(oracledb|mysql|mysql2|sqlite3|better-sqlite3|tedious)$/,
    }),
    // Ignorar drivers específicos do Knex
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
    }),
  ],
  externals: {
    // Marcar drivers como externos para evitar bundling
    'oracledb': 'commonjs oracledb',
    'mysql': 'commonjs mysql',
    'mysql2': 'commonjs mysql2',
    'sqlite3': 'commonjs sqlite3',
    'better-sqlite3': 'commonjs better-sqlite3',
    'tedious': 'commonjs tedious',
    'pg-native': 'commonjs pg-native',
  },
}; 