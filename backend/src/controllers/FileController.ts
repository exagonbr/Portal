import { Request, Response } from 'express';

class FileController {
    async upload(req: Request, res: Response) {
        res.status(201).json({ success: true, data: { message: 'upload file', data: req.body } });
    }

    async getAll(req: Request, res: Response) {
        res.json({ success: true, data: { message: `getAll files with query ${JSON.stringify(req.query)}` } });
    }

    async delete(req: Request, res: Response) {
        res.status(204).json({ success: true, message: 'File deleted successfully' });
    }
}

export default new FileController();