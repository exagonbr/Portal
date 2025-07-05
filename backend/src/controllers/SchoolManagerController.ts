import { Request, Response } from 'express';

class SchoolManagerController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll school managers with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get school manager by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create school manager', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update school manager ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for school manager ${id}`, data: req.body });
    }
}

export default new SchoolManagerController();