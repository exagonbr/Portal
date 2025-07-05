import { Request, Response } from 'express';
import { EducationPeriodRepository } from '../repositories/EducationPeriodRepository';
import { BaseController } from './BaseController';
import { EducationPeriod } from '../entities/EducationPeriod';

const educationPeriodRepository = new EducationPeriodRepository();

class EducationPeriodController extends BaseController<EducationPeriod> {
    constructor() {
        super(educationPeriodRepository);
    }

    async toggleStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const educationPeriod = await educationPeriodRepository.toggleStatus(id);
            if (!educationPeriod) {
                return res.status(404).json({ success: false, message: 'Education Period not found' });
            }
            return res.status(200).json({ success: true, data: educationPeriod });
        } catch (error) {
            console.error(`Error in toggleStatus: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async search(req: Request, res: Response) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
            }
            
            const educationPeriods = await educationPeriodRepository.findByDescription(q as string);
            return res.status(200).json({ success: true, data: educationPeriods });
        } catch (error) {
            console.error(`Error in search education periods: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async getActive(req: Request, res: Response) {
        try {
            const educationPeriods = await educationPeriodRepository.findActive();
            return res.status(200).json({ success: true, data: educationPeriods });
        } catch (error) {
            console.error(`Error in getActive: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}

export default new EducationPeriodController();