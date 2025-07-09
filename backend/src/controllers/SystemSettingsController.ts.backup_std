import { Request, Response } from 'express';
import { SystemSettingsRepository } from '../repositories/SystemSettingsRepository'
import { SystemSettings } from '../entities/SystemSettings';
import { BaseController } from './BaseController';

class SystemSettingsController extends BaseController<SystemSettings> {
  private systemSettingsRepository: SystemSettingsRepository;

  constructor() {
    const repository = new SystemSettingsRepository();
    super(repository);
    this.systemSettingsRepository = repository;
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.systemSettingsRepository.findAllPaginated({ page, limit, search });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const record = await this.systemSettingsRepository.findById(parseInt(id));

      if (!record) {
        return res.status(404).json({ success: false, message: 'Registro não encontrado' });
      }

      return res.status(200).json({ success: true, data: record });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;
      const record = await this.systemSettingsRepository.create(data);
      return res.status(201).json({ success: true, data: record });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const record = await this.systemSettingsRepository.update(parseInt(id), data);
      
      if (!record) {
        return res.status(404).json({ success: false, message: 'Registro não encontrado' });
      }

      return res.status(200).json({ success: true, data: record });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const success = await this.systemSettingsRepository.delete(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Registro não encontrado' });
      }

      return res.status(200).json({ success: true, data: { message: 'Registro deletado com sucesso' } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async search(req: Request, res: Response): Promise<Response> {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
      }
      
      const systemSettings = await this.systemSettingsRepository.searchByName(q as string);
      return res.status(200).json({ success: true, data: systemSettings });
    } catch (error) {
      console.error(`Error in search system settings: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new SystemSettingsController();
