import { Request, Response } from 'express';

class EducationalStageController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll educational stages with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get educational stage by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create educational stage', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update educational stage ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new EducationalStageController();