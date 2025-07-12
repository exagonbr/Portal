import { Request, Response } from 'express';

class UserClassController {
    async getAll(req: Request, res: Response) {
        res.json({ success: true, data: { message: `getAll user classes with query ${JSON.stringify(req.query)}` } });
    }

    async getById(req: Request, res: Response) {
        res.json({ success: true, data: { message: `get user class by id ${req.params.id}` } });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ success: true, data: { message: 'create user class', data: req.body } });
    }

    async update(req: Request, res: Response) {
        res.json({ success: true, data: { message: `update user class ${req.params.id}`, data: req.body } });
    }

    async delete(req: Request, res: Response) {
        res.status(204).json({ success: true, message: 'User class deleted successfully' });
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ success: true, data: { message: `toggle status for user class ${id}`, data: req.body } });
    }
}

export default new UserClassController();