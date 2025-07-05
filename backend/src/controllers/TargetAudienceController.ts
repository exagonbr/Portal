import { Request, Response } from 'express';

class TargetAudienceController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll target audiences with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get target audience by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create target audience', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update target audience ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for target audience ${id}`, data: req.body });
    }
}

export default new TargetAudienceController();