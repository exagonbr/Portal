import { Request, Response } from 'express';

class UserClassController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll user classes with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get user class by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create user class', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update user class ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for user class ${id}`, data: req.body });
    }
}

export default new UserClassController();