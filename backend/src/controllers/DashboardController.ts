import { Request, Response } from 'express';

class DashboardController {
    async getSystemDashboard(req: Request, res: Response) {
        res.json({ message: 'get system dashboard data' });
    }
}

export default new DashboardController();