import { Request, Response } from 'express';

class TagController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll tags with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get tag by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create tag', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update tag ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new TagController();