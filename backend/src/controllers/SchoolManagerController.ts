import { Request, Response } from 'express';

class SchoolManagerController {
    async getAll(req: Request, res: Response) {
        res.json({ success: true, data: { message: `getAll school managers with query ${JSON.stringify(req.query)}` } });
    }

    async getById(req: Request, res: Response) {
        res.json({ success: true, data: { message: `get school manager by id ${req.params.id}` } });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ success: true, data: { message: 'create school manager', data: req.body } });
    }

    async update(req: Request, res: Response) {
        res.json({ success: true, data: { message: `update school manager ${req.params.id}`, data: req.body } });
    }

    async delete(req: Request, res: Response) {
        res.status(204).json({ success: true, message: 'School manager deleted successfully' });
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ success: true, data: { message: `toggle status for school manager ${id}`, data: req.body } });
    }
}

export default new SchoolManagerController();