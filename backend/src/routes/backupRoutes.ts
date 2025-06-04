import { Router } from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
import { BackupController } from '../controllers/BackupController';

const router = Router();
const backupController = new BackupController();

// Middlewares de segurança
router.use(validateJWT);
router.use(requireRole(['SYSTEM_ADMIN'])); // Apenas administradores do sistema podem gerenciar backups

/**
 * @swagger
 * /api/admin/backups:
 *   get:
 *     summary: Lista todos os backups
 *     description: Retorna uma lista de todos os backups do sistema
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de backups
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro do servidor
 */
router.get('/', (req, res) => backupController.listBackups(req, res));

/**
 * @swagger
 * /api/admin/backups:
 *   post:
 *     summary: Cria um novo backup
 *     description: Inicia um novo job de backup do banco de dados e/ou arquivos
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Completo, Incremental, Diferencial]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Backup iniciado com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro do servidor
 */
router.post('/', (req, res) => backupController.createBackup(req, res));

/**
 * @swagger
 * /api/admin/backups/{id}:
 *   delete:
 *     summary: Remove um backup
 *     description: Remove um backup pelo ID
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do backup
 *     responses:
 *       200:
 *         description: Backup removido com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Backup não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.delete('/:id', (req, res) => backupController.deleteBackup(req, res));

/**
 * @swagger
 * /api/admin/backups/{id}/download:
 *   get:
 *     summary: Download de um backup
 *     description: Faz o download de um arquivo de backup
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do backup
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
 *         description: Backup não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.get('/:id/download', (req, res) => backupController.downloadBackup(req, res));

/**
 * @swagger
 * /api/admin/backups/{id}/restore:
 *   post:
 *     summary: Restaura um backup
 *     description: Inicia o processo de restauração de um backup
 *     tags:
 *       - Backups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do backup
 *     responses:
 *       200:
 *         description: Processo de restauração iniciado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Backup não encontrado
 *       500:
 *         description: Erro do servidor
 */
router.post('/:id/restore', (req, res) => backupController.restoreBackup(req, res));

export default router; 