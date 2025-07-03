import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Validação para criação de notificação
export const validateCreateNotification = [
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('message')
    .notEmpty()
    .withMessage('Mensagem é obrigatória')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mensagem deve ter entre 10 e 2000 caracteres'),
  
  body('type')
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Tipo deve ser: info, warning, success ou error'),
  
  body('category')
    .isIn(['academic', 'system', 'social', 'administrative'])
    .withMessage('Categoria deve ser: academic, system, social ou administrative'),
  
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Prioridade deve ser: low, medium ou high'),
  
  body('recipients')
    .optional()
    .isObject()
    .withMessage('Destinatários deve ser um objeto'),
  
  body('recipients.roles')
    .optional()
    .isArray()
    .withMessage('Roles deve ser um array'),
  
  body('recipients.specific')
    .optional()
    .isArray()
    .withMessage('Destinatários específicos deve ser um array'),
  
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Data de agendamento deve estar no formato ISO8601')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Data de agendamento deve ser no futuro');
      }
      return true;
    }),

  handleValidationErrors
];

// Validação para atualização de notificação
export const validateUpdateNotification = [
  param('id')
    .notEmpty()
    .withMessage('ID da notificação é obrigatório'),
  
  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('message')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mensagem deve ter entre 10 e 2000 caracteres'),
  
  body('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Tipo deve ser: info, warning, success ou error'),
  
  body('category')
    .optional()
    .isIn(['academic', 'system', 'social', 'administrative'])
    .withMessage('Categoria deve ser: academic, system, social ou administrative'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Prioridade deve ser: low, medium ou high'),
  
  body('status')
    .optional()
    .isIn(['pending', 'scheduled', 'sent', 'delivered', 'failed'])
    .withMessage('Status deve ser: pending, scheduled, sent, delivered ou failed'),

  handleValidationErrors
];

// Validação para parâmetros de consulta
export const validateNotificationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  query('category')
    .optional()
    .isIn(['all', 'academic', 'system', 'social', 'administrative'])
    .withMessage('Categoria deve ser: all, academic, system, social ou administrative'),
  
  query('type')
    .optional()
    .isIn(['all', 'info', 'warning', 'success', 'error'])
    .withMessage('Tipo deve ser: all, info, warning, success ou error'),
  
  query('status')
    .optional()
    .isIn(['all', 'read', 'unread', 'pending', 'scheduled', 'sent', 'delivered', 'failed'])
    .withMessage('Status deve ser: all, read, unread, pending, scheduled, sent, delivered ou failed'),
  
  query('priority')
    .optional()
    .isIn(['all', 'low', 'medium', 'high'])
    .withMessage('Prioridade deve ser: all, low, medium ou high'),
  
  query('unread_only')
    .optional()
    .isBoolean()
    .withMessage('unread_only deve ser um boolean'),

  handleValidationErrors
];

// Validação para ID de notificação
export const validateNotificationId = [
  param('id')
    .notEmpty()
    .withMessage('ID da notificação é obrigatório'),

  handleValidationErrors
];

// Validação para múltiplos IDs
export const validateBulkIds = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs deve ser um array com pelo menos um item')
    .custom((ids) => {
      if (!ids.every((id: any) => typeof id === 'string' || typeof id === 'number')) {
        throw new Error('Todos os IDs devem ser strings ou números');
      }
      return true;
    }),

  handleValidationErrors
];

// Validação para reagendamento
export const validateReschedule = [
  param('id')
    .notEmpty()
    .withMessage('ID da notificação é obrigatório'),
  
  body('scheduledFor')
    .notEmpty()
    .withMessage('Data de agendamento é obrigatória')
    .isISO8601()
    .withMessage('Data de agendamento deve estar no formato ISO8601')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data de agendamento deve ser no futuro');
      }
      return true;
    }),

  handleValidationErrors
];

// Validação para limpeza de notificações
export const validateCleanup = [
  body('olderThan')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('olderThan deve ser um número entre 1 e 365 dias'),

  handleValidationErrors
];

// Validação para envio de notificação (endpoint /send)
export const validateSendNotification = [
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  
  body('message')
    .notEmpty()
    .withMessage('Mensagem é obrigatória')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mensagem deve ter entre 10 e 2000 caracteres'),
  
  body('type')
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Tipo deve ser: info, warning, success ou error'),
  
  body('category')
    .isIn(['academic', 'system', 'social', 'administrative'])
    .withMessage('Categoria deve ser: academic, system, social ou administrative'),
  
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Prioridade deve ser: low, medium ou high'),
  
  body('sendPush')
    .optional()
    .isBoolean()
    .withMessage('sendPush deve ser um boolean'),
  
  body('sendEmail')
    .optional()
    .isBoolean()
    .withMessage('sendEmail deve ser um boolean'),
  
  body('recipients')
    .optional()
    .isObject()
    .withMessage('Destinatários deve ser um objeto'),
  
  body('recipients.userIds')
    .optional()
    .isArray()
    .withMessage('userIds deve ser um array'),
  
  body('recipients.emails')
    .optional()
    .isArray()
    .withMessage('emails deve ser um array')
    .custom((emails) => {
      if (emails && emails.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emails.every((email: string) => emailRegex.test(email))) {
          throw new Error('Todos os emails devem ter formato válido');
        }
      }
      return true;
    }),
  
  body('recipients.roles')
    .optional()
    .isArray()
    .withMessage('roles deve ser um array'),

  // Validação customizada para garantir que pelo menos um método de envio seja selecionado
  body()
    .custom((body) => {
      if (!body.sendPush && !body.sendEmail) {
        throw new Error('Pelo menos um método de envio deve ser selecionado (sendPush ou sendEmail)');
      }
      return true;
    }),

  handleValidationErrors
];

// Middleware para tratar erros de validação
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'body',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
  }
  
  next();
}

// Middleware para verificar permissões de notificação
export const checkNotificationPermissions = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  // Verificar se o usuário pode enviar notificações
  const canSendNotifications = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'MANAGER', 'TEACHER'].includes(user.role);
  
  if (!canSendNotifications && (req.method === 'POST' || req.path.includes('/send'))) {
    return res.status(403).json({
      success: false,
      message: 'Sem permissão para enviar notificações'
    });
  }

  next();
};

// Middleware para verificar se o usuário pode acessar notificações enviadas
export const checkSentNotificationsPermissions = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  // Apenas roles que podem enviar notificações podem ver as enviadas
  const canViewSentNotifications = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'MANAGER', 'TEACHER'].includes(user.role);
  
  if (!canViewSentNotifications) {
    return res.status(403).json({
      success: false,
      message: 'Sem permissão para visualizar notificações enviadas'
    });
  }

  next();
};