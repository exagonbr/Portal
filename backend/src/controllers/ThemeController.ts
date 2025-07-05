import { Request, Response } from 'express';

class ThemeController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll themes with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get theme by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create theme', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update theme ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for theme ${id}`, data: req.body });
    }
}

export default new ThemeController();