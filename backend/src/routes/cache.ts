import express from 'express';
import CacheController from '../controllers/CacheController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/cache/set:
 *   post:
 *     tags: [Cache]
 *     summary: Define um valor no cache
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 description: A chave do cache
 *               value:
 *                 type: object
 *                 description: O valor a ser armazenado
 *               ttl:
 *                 type: number
 *                 description: Tempo de vida em segundos (padrão 300)
 *     responses:
 *       200:
 *         description: Valor definido com sucesso
 */
router.post('/set', authenticateToken, CacheController.set);

/**
 * @swagger
 * /api/cache/get:
 *   get:
 *     tags: [Cache]
 *     summary: Obtém um valor do cache
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: A chave do cache
 *     responses:
 *       200:
 *         description: Valor obtido com sucesso
 */
router.get('/get', authenticateToken, CacheController.get);

/**
 * @swagger
 * /api/cache/delete:
 *   delete:
 *     tags: [Cache]
 *     summary: Remove um valor do cache
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 description: A chave do cache
 *     responses:
 *       200:
 *         description: Valor removido com sucesso
 */
router.delete('/delete', authenticateToken, CacheController.delete);

/**
 * @swagger
 * /api/cache/clear:
 *   post:
 *     tags: [Cache]
 *     summary: Limpa o cache com base em um padrão
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pattern:
 *                 type: string
 *                 description: Padrão para correspondência de chaves (padrão '*')
 *     responses:
 *       200:
 *         description: Cache limpo com sucesso
 */
router.post('/clear', authenticateToken, CacheController.clear);

/**
 * @swagger
 * /api/cache/invalidate:
 *   post:
 *     tags: [Cache]
 *     summary: Invalida o cache com base em um padrão específico
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pattern:
 *                 type: string
 *                 description: Padrão para correspondência de chaves a serem invalidadas
 *     responses:
 *       200:
 *         description: Cache invalidado com sucesso
 */
router.post('/invalidate', authenticateToken, CacheController.clear);

/**
 * @swagger
 * /api/cache/stats:
 *   get:
 *     tags: [Cache]
 *     summary: Obtém estatísticas do cache
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 */
router.get('/stats', authenticateToken, CacheController.getStats);

export default router; 