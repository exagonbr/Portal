import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';
import { connection } from './config/database';

const app = express();

// CORS
app.use(cors({
  origin: ['*', 'https://sabercon.com.br', 'https://www.sabercon.com.br', 'https://portal.sabercon.com.br',
  'https://www.portal.sabercon.com.br', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials'
  ]
}));

// Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());

// Rotas
app.use('/api', routes);

// Tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    // Executa as migrations
    await connection.migrate.latest();
    console.log('Migrations executadas com sucesso');

    console.log(`Servidor rodando na porta ${PORT}`);
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}); 