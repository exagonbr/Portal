import { Request, Response } from 'express';
import { SubjectRepository } from '../repositories/SubjectRepository';
import { BaseController } from './BaseController';
import { Subject } from '../entities/Subject';

const subjectRepository = new SubjectRepository();

class SubjectController extends BaseController<Subject> {
    constructor() {
        super(subjectRepository);
    }

    async toggleStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const subject = await subjectRepository.toggleStatus(id);
            if (!subject) {
                return res.status(404).json({ success: false, message: 'Subject not found' });
            }
            return res.status(200).json({ success: true, data: subject });
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
            
            const subjects = await subjectRepository.findByName(q as string);
            return res.status(200).json({ success: true, data: subjects });
        } catch (error) {
            console.error(`Error in search subjects: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async getActive(req: Request, res: Response) {
        try {
            const subjects = await subjectRepository.findActive();
            return res.status(200).json({ success: true, data: subjects });
        } catch (error) {
            console.error(`Error in getActive: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}

export default new SubjectController();