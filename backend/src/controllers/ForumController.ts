import { Request, Response } from 'express';

class ForumController {
    async getThreads(req: Request, res: Response) {
        res.json({ success: true, data: { message: `get forum threads with query ${JSON.stringify(req.query)}` } });
    }

    async getThreadById(req: Request, res: Response) {
        res.json({ success: true, data: { message: `get forum thread by id ${req.params.id}` } });
    }

    async createThread(req: Request, res: Response) {
        res.status(201).json({ success: true, data: { message: 'create forum thread', data: req.body } });
    }

    async updateThread(req: Request, res: Response) {
        res.json({ success: true, data: { message: `update forum thread ${req.params.id}`, data: req.body } });
    }

    async deleteThread(req: Request, res: Response) {
        res.status(204).json({ success: true, message: 'Thread deleted successfully' });
    }

    async getReplies(req: Request, res: Response) {
        res.json({ success: true, data: { message: `get replies for thread ${req.params.threadId}` } });
    }

    async createReply(req: Request, res: Response) {
        res.status(201).json({ success: true, data: { message: 'create reply', data: req.body } });
    }
}

export default new ForumController();