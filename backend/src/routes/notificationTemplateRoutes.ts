import { Router } from 'express';
import NotificationTemplateController from '../controllers/NotificationTemplateController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// GET /api/notifications/templates - Listar todos os templates com paginação
router.get('/', NotificationTemplateController.getAllTemplates);

// GET /api/notifications/templates/paginated - Listar templates com filtros avançados
router.get('/paginated', NotificationTemplateController.getTemplatesPaginated);

// GET /api/notifications/templates/public - Listar templates públicos
router.get('/public', NotificationTemplateController.getPublicTemplates);

// GET /api/notifications/templates/categories - Listar categorias disponíveis
router.get('/categories', NotificationTemplateController.getCategories);

// GET /api/notifications/templates/category/:category - Listar templates por categoria
router.get('/category/:category', NotificationTemplateController.getTemplatesByCategory);

// GET /api/notifications/templates/user/:userId - Listar templates de um usuário específico
router.get('/user/:userId', NotificationTemplateController.getTemplatesByUserId);

// GET /api/notifications/templates/:id - Buscar template por ID
router.get('/:id', NotificationTemplateController.getTemplateById);

// POST /api/notifications/templates - Criar novo template
router.post('/', NotificationTemplateController.createTemplate);

// PUT /api/notifications/templates/:id - Atualizar template
router.put('/:id', NotificationTemplateController.updateTemplate);

// DELETE /api/notifications/templates/:id - Excluir template
router.delete('/:id', NotificationTemplateController.deleteTemplate);

export default router; 