import { Request, Response } from 'express';
import { TvShowRepository } from '../repositories/TvShowRepository';

const tvShowRepository = new TvShowRepository();

class TvShowController {
    
    async getAll(req: Request, res: Response) {
        try {
            const tvShows = await tvShowRepository.findWithFilters({
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
                sortBy: 'name',
                sortOrder: req.query.sortOrder as 'asc' | 'desc',
                search: req.query.search as string,
            });
    
            if (!tvShows) {
                return res.status(404).json({ success: false, message: 'TV Shows not found' });
            }
            return res.status(200).json({ success: true, data: tvShows });
            } catch (error) {
                console.error(`Error in getAllTvShows: ${error}`);
                return res.status(500).json({ success: false, message: 'TV Shows Internal Server Error ' + error });
            }
        }

    

    async getById(req: Request, res: Response) {
        try {
            const tvShow = await tvShowRepository.findByIdForApi(req.params.id);
            if (!tvShow) {
                return res.status(404).json({ success: false, message: 'TV Shows not found' });
            }
            return res.status(200).json({ success: true, data: tvShow });
            } catch (error) {
                console.error(`Error in getByIdTvShows: ${error}`);
                return res.status(500).json({ success: false, message: 'Internal Server Error ' + error });
            }
        }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create tv show', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update tv show ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }

    async toggleStatus(req: Request, res: Response) {
        const { id } = req.params;
        res.json({ message: `toggle status for tv show ${id}`, data: req.body });
    }
}

export default new TvShowController();