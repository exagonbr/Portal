import { Request, Response } from 'express';

class EducationCycleController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll education cycles with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get education cycle by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create education cycle', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update education cycle ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new EducationCycleController();