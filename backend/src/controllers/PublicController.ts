import { Request, Response } from 'express';

class PublicController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll publics with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get public by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create public', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update public ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new PublicController();