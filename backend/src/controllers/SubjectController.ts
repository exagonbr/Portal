import { Request, Response } from 'express';

class SubjectController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll subjects with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get subject by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create subject', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update subject ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for subject ${id}`, data: req.body });
    }
}

export default new SubjectController();