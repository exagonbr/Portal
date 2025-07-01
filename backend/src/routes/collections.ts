import { Router } from 'express';
import { TVShowController } from '../controllers/TVShowController';
import { VideoCollectionController } from '../controllers/VideoCollectionController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const videoCollectionController = new VideoCollectionController();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// === ROTAS DE GERENCIAMENTO (NOVO SISTEMA) ===
// Middleware para verificar role SYSTEM_ADMIN
const requireSystemAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  if (user.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores do sistema'
    });
  }
  next();
};

// Aplicar verificação de role para rotas administrativas
router.use('/manage', requireSystemAdmin);
router.use('/migrate', requireSystemAdmin);
router.use('/migration', requireSystemAdmin);

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