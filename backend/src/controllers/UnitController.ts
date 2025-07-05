import { Request, Response } from 'express';

class UnitController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll units with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get unit by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create unit', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update unit ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new UnitController();