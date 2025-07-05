import { Request, Response } from 'express';

class VideoController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll videos with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get video by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create video', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update video ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new VideoController();