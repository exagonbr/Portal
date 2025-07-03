import { Router } from 'express';
import { VideoCollectionController } from '../controllers/VideoCollectionController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth';

const router = Router();
const videoCollectionController = new VideoCollectionController();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// === ROTAS DE GERENCIAMENTO (ADMIN APENAS) ===

// Aplicar middleware de role para rotas administrativas
router.use('/manage', requireRole(['SYSTEM_ADMIN']));
router.use('/migrate', requireRole(['SYSTEM_ADMIN']));
router.use('/migration', requireRole(['SYSTEM_ADMIN']));

// Gerenciamento de coleções
router.get('/manage', videoCollectionController.getAllCollections.bind(videoCollectionController));
router.get('/manage/:id', videoCollectionController.getCollectionById.bind(videoCollectionController));
router.post('/manage', videoCollectionController.createCollection.bind(videoCollectionController));
router.put('/manage/:id', videoCollectionController.updateCollection.bind(videoCollectionController));
router.delete('/manage/:id', videoCollectionController.deleteCollection.bind(videoCollectionController));

// Gerenciamento de vídeos
router.post('/manage/videos', videoCollectionController.createVideo.bind(videoCollectionController));
router.put('/manage/videos/:id', videoCollectionController.updateVideo.bind(videoCollectionController));
router.delete('/manage/videos/:id', videoCollectionController.deleteVideo.bind(videoCollectionController));

// Migração
router.post('/migrate', videoCollectionController.migrateFromMySQL.bind(videoCollectionController));
router.get('/migration/stats', videoCollectionController.getMigrationStats.bind(videoCollectionController));

// === ROTAS PÚBLICAS (VISUALIZAÇÃO) ===

// Coleções públicas - acessível por todos os usuários autenticados
router.get('/public', videoCollectionController.getPublicCollections.bind(videoCollectionController));
router.get('/public/search', videoCollectionController.searchPublicCollections.bind(videoCollectionController));
router.get('/public/popular', videoCollectionController.getPopularCollections.bind(videoCollectionController));

export default router; 