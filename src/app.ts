import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes';
import { connection } from './config/database';

const app = express();

// Middlewares
app.use(cors());
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