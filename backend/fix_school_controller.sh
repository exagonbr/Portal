#!/bin/bash

cat > src/controllers/SchoolController.ts << 'EOL'
import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { School } from '../entities/School';
import { SchoolRepository } from '../repositories/SchoolRepository';

class SchoolController extends BaseController<School> {
  private schoolRepository: SchoolRepository;

  constructor() {
    const repository = new SchoolRepository();
    super(repository);
    this.schoolRepository = repository;
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page = '1', limit = '10', search, institution_id } = req.query;
      
      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string
      };

      const result = await this.schoolRepository.findAllPaginated(options);
      
      // Se institution_id estiver presente, filtramos os resultados
      let filteredData = result.data;
      if (institution_id) {
        const institutionId = parseInt(institution_id as string, 10);
        filteredData = filteredData.filter(school => school.institutionId === institutionId);
      }
      
      return res.json({
        success: true,
        items: filteredData,
        total: result.total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(result.total / options.limit)
      });
    } catch (error) {
      console.error(`Error in getAll: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async toggleStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const school = await this.schoolRepository.toggleStatus(id);
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
EOL

echo "SchoolController.ts foi corrigido." 