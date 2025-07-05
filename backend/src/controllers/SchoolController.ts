import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { School } from '../entities/School';
import { SchoolRepository } from '../repositories/SchoolRepository';

const schoolRepository = new SchoolRepository();

class SchoolController extends BaseController<School> {
  constructor() {
    super(schoolRepository);
  }

  public async toggleStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const school = await schoolRepository.toggleStatus(id);
      if (!school) {
        return res.status(404).json({ success: false, message: 'School not found' });
      }
      return res.status(200).json({ success: true, data: school });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new SchoolController();