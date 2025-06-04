import express from 'express';
import { validateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/queue/next:
 *   get:
 *     summary: Próximos jobs da fila para processamento
 *     description: Retorna os próximos jobs disponíveis para processamento na fila
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *           maximum: 50
 *         description: Número máximo de jobs a retornar
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *         description: Filtrar por prioridade específica
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de job específico
 *     responses:
 *       200:
 *         description: Lista de jobs próximos para processamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID único do job
 *                       type:
 *                         type: string
 *                         description: Tipo do job
 *                       data:
 *                         type: object
 *                         description: Dados do job
 *                       priority:
 *                         type: integer
 *                         description: Prioridade do job
 *                       attempts:
 *                         type: integer
 *                         description: Número de tentativas
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Data de criação
 *                       status:
 *                         type: string
 *                         enum: [pending, processing, completed, failed, delayed]
 *                         description: Status atual do job
 *                 message:
 *                   type: string
 *                   example: Jobs encontrados com sucesso
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/next', validateJWT, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 50);
    const priority = req.query.priority ? parseInt(req.query.priority as string) : undefined;
    const type = req.query.type as string;

    // Simulação de busca de jobs próximos - substituir pela implementação real
    const jobs = [
      {
        id: `job_${Date.now()}_1`,
        type: type || 'email',
        data: {
          recipient: 'usuario@exemplo.com',
          subject: 'Notificação do Sistema',
          template: 'notification'
        },
        priority: priority || 1,
        attempts: 0,
        max_attempts: 3,
        created_at: new Date(),
        status: 'pending' as const
      },
      {
        id: `job_${Date.now()}_2`,
        type: type || 'notification',
        data: {
          userId: 'user123',
          title: 'Nova Mensagem',
          message: 'Você tem uma nova mensagem'
        },
        priority: priority || 0,
        attempts: 0,
        max_attempts: 3,
        created_at: new Date(Date.now() - 1000),
        status: 'pending' as const
      }
    ].filter(job => !type || job.type === type)
     .filter(job => priority === undefined || job.priority === priority)
     .slice(0, limit);

    return res.json({
      success: true,
      data: jobs,
      message: `${jobs.length} jobs encontrados`,
      pagination: {
        limit,
        total: jobs.length
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar próximos jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar próximos jobs da fila',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/queue/stats:
 *   get:
 *     summary: Estatísticas da fila
 *     description: Retorna estatísticas gerais das filas de processamento
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das filas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: integer
 *                     processing:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Não autorizado
 */
router.get('/stats', validateJWT, async (req, res) => {
  try {
    // Implementação de estatísticas básicas
    const stats: {
      pending: number;
      processing: number;
      completed: number;
      failed: number;
      total: number;
    } = {
      pending: Math.floor(Math.random() * 20 + 5),
      processing: Math.floor(Math.random() * 5 + 1),
      completed: Math.floor(Math.random() * 100 + 200),
      failed: Math.floor(Math.random() * 10 + 2),
      total: 0
    };
    
    stats.total = stats.pending + stats.processing + stats.completed + stats.failed;

    return res.json({
      success: true,
      data: stats,
      message: 'Estatísticas obtidas com sucesso'
    });
    
  } catch (error: any) {
    console.error('Erro ao obter estatísticas da fila:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas da fila',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/queue/add:
 *   post:
 *     summary: Adiciona job à fila
 *     description: Adiciona um novo job à fila de processamento
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - data
 *             properties:
 *               type:
 *                 type: string
 *                 description: Tipo do job
 *                 example: email
 *               data:
 *                 type: object
 *                 description: Dados do job
 *               priority:
 *                 type: integer
 *                 default: 0
 *                 description: Prioridade do job (maior = mais prioritário)
 *               delay:
 *                 type: integer
 *                 default: 0
 *                 description: Delay em milissegundos antes de processar
 *               maxAttempts:
 *                 type: integer
 *                 default: 3
 *                 description: Número máximo de tentativas
 *     responses:
 *       201:
 *         description: Job adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/add', validateJWT, async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        message: 'Tipo e dados do job são obrigatórios'
      });
    }

    // Simulação de adição de job - substituir pela implementação real
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return res.status(201).json({
      success: true,
      data: { jobId },
      message: 'Job adicionado à fila com sucesso'
    });
    
  } catch (error: any) {
    console.error('Erro ao adicionar job à fila:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar job à fila',
      error: error.message
    });
  }
});

export default router; 