import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Unit } from '../entities/Unit';
import { UnitRepository } from '../repositories/UnitRepository'
import { School } from '../entities/School';;

const unitRepository = new UnitRepository();

class SchoolController extends BaseController<Unit> {
  constructor() {
    const repository = new SchoolRepository();
    super(repository);
    this.schoolRepository = repository;
    super(unitRepository);
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page = '1', limit = '10', search, institution_id } = req.query;
      
      const filters = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string,
        institutionId: institution_id ? parseInt(institution_id as string, 10) : undefined
      };

      const result = await unitRepository.findWithFilters(filters);
      
      return res.json({
        success: true,
        items: result.data,
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(result.total / filters.limit)
      });
    } catch (error) {
      console.error(`Error in getAll: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async toggleStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const unit = await unitRepository.toggleStatus(id);
      if (!unit) {
        return res.status(404).json({ success: false, message: 'School not found' });
      }
      return res.status(200).json({ success: true, data: unit });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new SchoolController();