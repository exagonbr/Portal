import { Request, Response } from 'express';

class RoleController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll roles with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get role by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create role', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update role ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for role ${id}`, data: req.body });
    }
}

export default new RoleController();