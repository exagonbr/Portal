import { Request, Response } from 'express';
import { LanguageRepository } from '../repositories/LanguageRepository';
import { BaseController } from './BaseController';
import { Language } from '../entities/Language';

const languageRepository = new LanguageRepository();

class LanguageController extends BaseController<Language> {
    constructor() {
    const repository = new LanguageRepository();
    super(repository);
    this.languageRepository = repository;
        super(languageRepository);
    }

    async toggleStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const language = await languageRepository.toggleStatus(id);
            if (!language) {
                return res.status(404).json({ success: false, message: 'Language not found' });
            }
            return res.status(200).json({ success: true, data: language });
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
            
            const languages = await languageRepository.findByName(q as string);
            return res.status(200).json({ success: true, data: languages });
        } catch (error) {
            console.error(`Error in search languages: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async findByCode(req: Request, res: Response) {
        try {
            const { code } = req.params;
            const language = await languageRepository.findByCode(code);
            
            if (!language) {
                return res.status(404).json({ success: false, message: 'Language not found' });
            }
            
            return res.status(200).json({ success: true, data: language });
        } catch (error) {
            console.error(`Error in findByCode: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async getActive(req: Request, res: Response) {
        try {
            const languages = await languageRepository.findActive();
            return res.status(200).json({ success: true, data: languages });
        } catch (error) {
            console.error(`Error in getActive: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}

export default new LanguageController();