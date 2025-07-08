import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';

class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
    const repository = new DashboardRepository();
    super(repository);
    this.dashboardRepository = repository;
        this.dashboardService = new DashboardService();
    }

    async getSystemDashboard(req: Request, res: Response) {
        try {
            const dashboardData = await this.dashboardService.getSystemDashboard();
            return res.json({
                success: true,
                data: dashboardData
            });
        } catch (error) {
            console.error('Erro ao obter dados do dashboard:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao obter dados do dashboard'
            });
        }
    }
}

export default new DashboardController();