import { Request, Response } from 'express';
import { CollectionService } from '../services/CollectionService';

const collectionService = new CollectionService();

class CollectionController {
    
    async getAll(req: Request, res: Response) {
        try {
            const collections = await collectionService.getAllCollections({
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
                sortBy: req.query.sortBy as string || 'name',
                sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'asc',
                search: req.query.search as string,
            });
    
            if (!collections) {
                return res.status(404).json({ success: false, message: 'Collections not found' });
            }
            return res.status(200).json({ success: true, data: collections });
        } catch (error) {
            console.error(`Error in getAllCollections: ${error}`);
            return res.status(500).json({ success: false, message: 'Collections Internal Server Error ' + error });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const collection = await collectionService.getCollectionById(req.params.id);
            if (!collection) {
                return res.status(404).json({ success: false, message: 'Collection not found' });
            }
            return res.status(200).json({ success: true, data: collection });
        } catch (error) {
            console.error(`Error in getByIdCollection: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error ' + error });
        }
    }

    async search(req: Request, res: Response) {
        try {
            const searchTerm = req.query.q as string;
            const collections = await collectionService.searchCollections(searchTerm, {
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
                sortBy: req.query.sortBy as string || 'name',
                sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'asc',
            });
    
            return res.status(200).json({ success: true, data: collections });
        } catch (error) {
            console.error(`Error in searchCollections: ${error}`);
            return res.status(500).json({ success: false, message: 'Search Internal Server Error ' + error });
        }
    }

    async getPopular(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const collections = await collectionService.getPopularCollections(limit);
    
            return res.status(200).json({ success: true, data: collections });
        } catch (error) {
            console.error(`Error in getPopularCollections: ${error}`);
            return res.status(500).json({ success: false, message: 'Popular Collections Internal Server Error ' + error });
        }
    }

    async getTopRated(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const collections = await collectionService.getTopRatedCollections(limit);
    
            return res.status(200).json({ success: true, data: collections });
        } catch (error) {
            console.error(`Error in getTopRatedCollections: ${error}`);
            return res.status(500).json({ success: false, message: 'Top Rated Collections Internal Server Error ' + error });
        }
    }

    async getRecent(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const collections = await collectionService.getRecentCollections(limit);
    
            return res.status(200).json({ success: true, data: collections });
        } catch (error) {
            console.error(`Error in getRecentCollections: ${error}`);
            return res.status(500).json({ success: false, message: 'Recent Collections Internal Server Error ' + error });
        }
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create collection', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update collection ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new CollectionController();