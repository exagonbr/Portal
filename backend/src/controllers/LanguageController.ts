import { Request, Response } from 'express';

class LanguageController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll languages with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get language by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create language', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update language ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for language ${id}`, data: req.body });
    }
}

export default new LanguageController();