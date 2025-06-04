import { Router } from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
import { AdminController } from '../controllers/AdminController';

const router = Router();
const adminController = new AdminController();

/**
 * @swagger
 * /api/admin/backups:
 *   get:
 *     summary: Lista todos os backups
 *     description: Retorna uma lista de todos os backups disponíveis
 *     tags: [Admin, Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de backups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 backups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: backup-2023-11-25T00-00-00Z.sql
 *                       size:
 *                         type: number
 *                         example: 1024000
 *                       created:
 *                         type: string
 *                         example: 2023-11-25T00:00:00.000Z
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro no servidor
 */
router.get('/backups', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.listBackups
);

/**
 * @swagger
 * /api/admin/backups:
 *   post:
 *     summary: Cria um novo backup
 *     description: Cria um backup do banco de dados
 *     tags: [Admin, Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Backup criado com sucesso
 *                 file:
 *                   type: string
 *                   example: backup-2023-11-25T00-00-00Z.sql
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro no servidor
 */
router.post('/backups', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.createBackup
);

/**
 * @swagger
 * /api/admin/backups/{filename}:
 *   get:
 *     summary: Baixa um backup
 *     description: Baixa um arquivo de backup específico
 *     tags: [Admin, Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do arquivo de backup
 *     responses:
 *       200:
 *         description: Arquivo de backup
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Arquivo não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.get('/backups/:filename', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.downloadBackup
);

/**
 * @swagger
 * /api/admin/backups/{filename}/restore:
 *   post:
 *     summary: Restaura um backup
 *     description: Restaura o banco de dados a partir de um arquivo de backup
 *     tags: [Admin, Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do arquivo de backup
 *     responses:
 *       200:
 *         description: Backup restaurado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Backup restaurado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Arquivo não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.post('/backups/:filename/restore', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.restoreBackup
);

/**
 * @swagger
 * /api/admin/backups/{filename}:
 *   delete:
 *     summary: Exclui um backup
 *     description: Remove um arquivo de backup específico
 *     tags: [Admin, Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do arquivo de backup
 *     responses:
 *       200:
 *         description: Backup excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Backup excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Arquivo não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.delete('/backups/:filename', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.deleteBackup
);

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Logs de auditoria
 *     description: Retorna os logs de auditoria do sistema com paginação e filtros
 *     tags: [Admin, Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Quantidade de registros por página
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de ação
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (formato YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de logs de auditoria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       user_name:
 *                         type: string
 *                       user_email:
 *                         type: string
 *                       action:
 *                         type: string
 *                       data:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro no servidor
 */
router.get('/audit-logs', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.getAuditLogs
);

/**
 * @swagger
 * /api/admin/queue/stats:
 *   get:
 *     summary: Estatísticas das filas
 *     description: Retorna estatísticas de todas as filas de processamento
 *     tags: [Admin, Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das filas
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro no servidor
 */
router.get('/queue/stats', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.getQueueStats
);

/**
 * @swagger
 * /api/admin/queue/clean:
 *   post:
 *     summary: Limpa filas
 *     description: Remove jobs completados e falhos das filas
 *     tags: [Admin, Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filas limpas com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro no servidor
 */
router.post('/queue/clean', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.cleanQueues
);

/**
 * @swagger
 * /api/admin/queue/next:
 *   get:
 *     summary: Próximos jobs da fila
 *     description: Retorna os próximos jobs a serem processados
 *     tags: [Admin, Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de jobs
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro no servidor
 */
router.get('/queue/next', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.getNextJobs
);

/**
 * @swagger
 * /api/admin/queue/failed:
 *   get:
 *     summary: Jobs falhos
 *     description: Retorna jobs que falharam durante o processamento
 *     tags: [Admin, Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de jobs falhos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro no servidor
 */
router.get('/queue/failed', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.getFailedJobs
);

/**
 * @swagger
 * /api/admin/queue/retry/{id}:
 *   post:
 *     summary: Reprocessa job
 *     description: Tenta processar novamente um job que falhou
 *     tags: [Admin, Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do job
 *     responses:
 *       200:
 *         description: Job reprocessado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Job não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.post('/queue/retry/:id', 
  validateJWT, 
  requireRole(['SYSTEM_ADMIN']), 
  adminController.retryJob
);

export default router; 