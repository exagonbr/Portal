import { Router } from 'express';
import { TVShowController } from '../controllers/TVShowController';
import { VideoCollectionController } from '../controllers/VideoCollectionController';
import {
  optimizedAuthMiddleware,
  requireRole
} from '../middleware/optimizedAuth.middleware';

const router = Router();
const videoCollectionController = new VideoCollectionController();

// Aplicar middleware de autenticação em todas as rotas
router.use(optimizedAuthMiddleware);

// === ROTAS DE GERENCIAMENTO (NOVO SISTEMA) ===
// Redirecionar para o novo sistema de video-collections

// Aplicar middleware de role para rotas administrativas
router.use('/manage', requireRole('SYSTEM_ADMIN'));
router.use('/migrate', requireRole('SYSTEM_ADMIN'));
router.use('/migration', requireRole('SYSTEM_ADMIN'));

// Gerenciamento de coleções (novo sistema)
router.get('/manage', videoCollectionController.getAllCollections.bind(videoCollectionController));
router.get('/manage/:id', videoCollectionController.getCollectionById.bind(videoCollectionController));
router.post('/manage', videoCollectionController.createCollection.bind(videoCollectionController));
router.put('/manage/:id', videoCollectionController.updateCollection.bind(videoCollectionController));
router.delete('/manage/:id', videoCollectionController.deleteCollection.bind(videoCollectionController));

// Gerenciamento de vídeos (novo sistema)
router.post('/manage/videos', videoCollectionController.createVideo.bind(videoCollectionController));
router.put('/manage/videos/:id', videoCollectionController.updateVideo.bind(videoCollectionController));
router.delete('/manage/videos/:id', videoCollectionController.deleteVideo.bind(videoCollectionController));

// Migração (novo sistema)
router.post('/migrate', videoCollectionController.migrateFromMySQL.bind(videoCollectionController));
router.get('/migration/stats', videoCollectionController.getMigrationStats.bind(videoCollectionController));

// === ROTAS PÚBLICAS (SISTEMA LEGADO) ===
// Manter compatibilidade com o sistema antigo

// Rotas para coleções (sistema legado - TVShowController)
router.get('/', TVShowController.getAllCollections);
router.get('/search', TVShowController.searchCollections);
router.get('/popular', TVShowController.getPopularCollections);
router.get('/top-rated', TVShowController.getTopRatedCollections);
router.get('/recent', TVShowController.getRecentCollections);
router.get('/:id', TVShowController.getCollectionById);

export default router; 