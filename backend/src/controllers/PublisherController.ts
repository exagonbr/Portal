import { Request, Response } from 'express';

class PublisherController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll publishers with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get publisher by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create publisher', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update publisher ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for publisher ${id}`, data: req.body });
    }
}

export default new PublisherController();