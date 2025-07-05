import { Request, Response } from 'express';

class VideoModuleController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll video modules with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get video module by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create video module', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update video module ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new VideoModuleController();