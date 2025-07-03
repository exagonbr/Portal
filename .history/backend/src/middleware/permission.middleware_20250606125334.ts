import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate if the user has the required permission.
 * @param permission The permission string to check, e.g. 'institutions:read'
 */
export const validatePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // TODO: Implement actual permission check logic here
    // For now, allow all authenticated users
    // You can extend this to check user roles and permissions from DB or JWT claims

    next();
  };
};
