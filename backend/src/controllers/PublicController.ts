import { Request, Response } from 'express';
import { PublicRepository } from '../repositories/PublicRepository';
import { BaseController } from './BaseController';
import { Public } from '../entities/Public';

const publicRepository = new PublicRepository();

class PublicController extends BaseController<Public> {
    constructor() {
    const repository = new PublicRepository();
    super(repository);
    this.publicRepository = repository;
        super(publicRepository);
    }

    async search(req: Request, res: Response) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
            }
            
            const publics = await publicRepository.findByName(q as string);
            return res.status(200).json({ success: true, data: publics });
        } catch (error) {
            console.error(`Error in search publics: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async findByApiId(req: Request, res: Response) {
        try {
            const { apiId } = req.params;
            const publicItem = await publicRepository.findByApiId(parseInt(apiId));
            
            if (!publicItem) {
                return res.status(404).json({ success: false, message: 'Public not found' });
            }
            
            return res.status(200).json({ success: true, data: publicItem });
        } catch (error) {
            console.error(`Error in findByApiId: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}

export default new PublicController();