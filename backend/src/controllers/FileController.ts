import { Request, Response } from 'express';

class FileController {
    async upload(req: Request, res: Response) {
        res.status(201).json({ message: 'upload file', data: req.body });
    }

    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll files with query ${JSON.stringify(req.query)}` });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new FileController();