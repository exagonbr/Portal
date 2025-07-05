import { Request, Response } from 'express';

class GenreController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll genres with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get genre by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create genre', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update genre ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new GenreController();