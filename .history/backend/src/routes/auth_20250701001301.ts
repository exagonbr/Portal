import { Router } from 'express';
import passport from 'passport';
import AuthController from '../controllers/AuthController';
import { OptimizedAuthController } from '../controllers/OptimizedAuthController';

const router = Router();

router.post('/login', OptimizedAuthController.login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  AuthController.googleCallback
);

export default router;
