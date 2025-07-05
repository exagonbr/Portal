import { Request, Response } from 'express';

class SessionController {
    async getActiveSessions(req: Request, res: Response) {
        res.json({ message: 'get active sessions' });
    }

    async terminateSession(req: Request, res: Response) {
        res.status(200).json({ success: true, message: `terminate session ${req.params.sessionId}` });
    }
}

export default new SessionController();