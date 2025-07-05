import { Request, Response } from 'express';

class MediaEntryController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll media entries with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get media entry by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create media entry', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update media entry ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for media entry ${id}`, data: req.body });
    }
}

export default new MediaEntryController();