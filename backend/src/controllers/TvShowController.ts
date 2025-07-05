import { Request, Response } from 'express';
import { TvShowRepository } from '../repositories/TvShowRepository';
import { BaseController } from './BaseController';
import { TvShow } from '../entities/TVShow';

const tvShowRepository = new TvShowRepository();

class TvShowController extends BaseController<TvShow> {
    constructor() {
        super(tvShowRepository);
    }
    
    async getAll(req: Request, res: Response) {
        try {
            // Adicionar timeout para evitar travamentos
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout na busca de TV Shows')), 25000); // 25 segundos
            });

            const tvShowsPromise = tvShowRepository.findWithFilters({
                page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
                sortBy: 'title',
                sortOrder: req.query.sortOrder as 'asc' | 'desc',
                search: req.query.search as string,
            });

            const tvShows = await Promise.race([tvShowsPromise, timeoutPromise]);
    
            if (!tvShows) {
                return res.status(404).json({ success: false, message: 'TV Shows not found' });
            }
            
            return res.status(200).json({ success: true, data: tvShows });
        } catch (error) {
            console.error(`Error in getAllTvShows: ${error}`);
            
            // Se for timeout, retornar erro específico
            if (error instanceof Error && error.message.includes('Timeout')) {
                return res.status(504).json({ 
                    success: false, 
                    message: 'Timeout na busca de TV Shows - operação demorou muito',
                    code: 'TIMEOUT_ERROR'
                });
            }
            
            return res.status(500).json({ 
                success: false, 
                message: 'TV Shows Internal Server Error: ' + error,
                code: 'INTERNAL_ERROR'
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            // Adicionar timeout para evitar travamentos
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout na busca de TV Show')), 25000); // 25 segundos
            });

            const tvShowPromise = tvShowRepository.findByIdForApi(req.params.id);
            const tvShow = await Promise.race([tvShowPromise, timeoutPromise]);
            
            if (!tvShow) {
                return res.status(404).json({ success: false, message: 'TV Show not found' });
            }
            
            return res.status(200).json({ success: true, data: tvShow });
        } catch (error) {
            console.error(`Error in getByIdTvShows: ${error}`);
            
            // Se for timeout, retornar erro específico
            if (error instanceof Error && error.message.includes('Timeout')) {
                return res.status(504).json({ 
                    success: false, 
                    message: 'Timeout na busca de TV Show - operação demorou muito',
                    code: 'TIMEOUT_ERROR'
                });
            }
            
            return res.status(500).json({ 
                success: false, 
                message: 'Internal Server Error: ' + error,
                code: 'INTERNAL_ERROR'
            });
        }
    }

    async toggleStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const tvShow = await tvShowRepository.toggleStatus(id);
            if (!tvShow) {
                return res.status(404).json({ success: false, message: 'TV Show not found' });
            }
            return res.status(200).json({ success: true, data: tvShow });
        } catch (error) {
            console.error(`Error in toggleStatus: ${error}`);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}

export default new TvShowController();