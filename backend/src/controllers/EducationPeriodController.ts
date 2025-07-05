import { Request, Response } from 'express';

class EducationPeriodController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll education periods with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get education period by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create education period', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update education period ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for education period ${id}`, data: req.body });
    }
}

export default new EducationPeriodController();