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
        try {
            const newCollection = await collectionService.createCollection(req.body);
            return res.status(201).json({ success: true, data: newCollection });
        } catch (error) {
            console.error(`Error in createCollection: ${error}`);
            return res.status(500).json({ success: false, message: 'Error creating collection: ' + error });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const updatedCollection = await collectionService.updateCollection(req.params.id, req.body);
            if (!updatedCollection) {
                return res.status(404).json({ success: false, message: 'Collection not found' });
            }
            return res.status(200).json({ success: true, data: updatedCollection });
        } catch (error) {
            console.error(`Error in updateCollection: ${error}`);
            return res.status(500).json({ success: false, message: 'Error updating collection: ' + error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result = await collectionService.deleteCollection(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Collection not found' });
            }
            return res.status(200).json({ success: true, message: 'Collection deleted successfully' });
        } catch (error) {
            console.error(`Error in deleteCollection: ${error}`);
            return res.status(500).json({ success: false, message: 'Error deleting collection: ' + error });
        }
    }
}

export default new CollectionController();