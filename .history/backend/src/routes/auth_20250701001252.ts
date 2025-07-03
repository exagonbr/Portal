import { Router } from 'express';
import passport from 'passport';
import AuthController from '../controllers/AuthController';
import { OptimizedAuthController } from '../controllers/OptimizedAuthController';

const router = Router();

// A rota de login foi movida para optimizedAuth.routes.ts para centralizar a lógica
// e garantir que a validação e o tratamento de erros sejam aplicados.
// router.post('/login', OptimizedAuthController.login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  AuthController.googleCallback
);

export default router;
