import { Router, Request, Response } from 'express';

const router = Router();

// Rota de teste simples
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Test settings route is working!',
    timestamp: new Date().toISOString()
  });
});

// Rota pública de teste
router.get('/public-test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Public test route is working!',
    data: {
      site_name: 'Portal Sabercon',
      site_title: 'Portal Educacional Sabercon'
    }
  });
});

export default router;