import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class RoleController {
  async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await prisma.role.findMany();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching roles', error });
    }
  }
}

export default new RoleController();