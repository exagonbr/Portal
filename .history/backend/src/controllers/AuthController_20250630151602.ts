import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { User } from '../entities/User';

class AuthController {
  public async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as User;
      const token = AuthService.generateToken(user);
      // TODO: Redirect to a frontend page with the token
      res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    } catch (error) {
      res.status(500).json({ message: 'Error during Google authentication' });
    }
  }
}

export default new AuthController();
