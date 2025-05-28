import { Request, Response } from 'express';
import { InstitutionRepository } from '../repositories/InstitutionRepository';
import { CreateInstitutionData, UpdateInstitutionData } from '../models/Institution';
import { validationResult } from 'express-validator';

export class InstitutionController {
  private institutionRepository: InstitutionRepository;

  constructor() {
    this.institutionRepository = new InstitutionRepository();
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 10, search, type } = req.query;
      
      let institutions;
      
      if (search && typeof search === 'string') {
        institutions = await this.institutionRepository.searchInstitutions(search);
      } else if (type && typeof type === 'string') {
        institutions = await this.institutionRepository.findByType(type);
      } else {
        institutions = await this.institutionRepository.findAll(
          {},
          { page: parseInt(page as string), limit: parseInt(limit as string) }
        );
      }

      return res.json({
        success: true,
        data: institutions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: institutions.length
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving institutions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Institution ID is required'
        });
      }

      const institution = await this.institutionRepository.findById(id);

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      return res.json({
        success: true,
        data: institution
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getByCode(req: Request, res: Response): Promise<Response> {
    try {
      const { code } = req.params;
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Institution code is required'
        });
      }

      const institution = await this.institutionRepository.findByCode(code);

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      return res.json({
        success: true,
        data: institution
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const institutionData: CreateInstitutionData = req.body;
      
      // Check if institution with same code already exists
      const existingInstitution = await this.institutionRepository.findByCode(institutionData.code);
      if (existingInstitution) {
        return res.status(409).json({
          success: false,
          message: 'Institution with this code already exists'
        });
      }

      const institution = await this.institutionRepository.createInstitution(institutionData);

      return res.status(201).json({
        success: true,
        data: institution,
        message: 'Institution created successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Institution ID is required'
        });
      }

      const updateData: UpdateInstitutionData = req.body;

      // Check if institution exists
      const existingInstitution = await this.institutionRepository.findById(id);
      if (!existingInstitution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      // Check if code is being updated and if it conflicts with another institution
      if (updateData.code && updateData.code !== existingInstitution.code) {
        const institutionWithCode = await this.institutionRepository.findByCode(updateData.code);
        if (institutionWithCode) {
          return res.status(409).json({
            success: false,
            message: 'Institution with this code already exists'
          });
        }
      }

      const institution = await this.institutionRepository.updateInstitution(id, updateData);

      return res.json({
        success: true,
        data: institution,
        message: 'Institution updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Institution ID is required'
        });
      }

      const institution = await this.institutionRepository.findById(id);
      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      const deleted = await this.institutionRepository.deleteInstitution(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete institution'
        });
      }

      return res.json({
        success: true,
        message: 'Institution deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting institution',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Institution ID is required'
        });
      }

      const institution = await this.institutionRepository.findById(id);
      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      const stats = await this.institutionRepository.getInstitutionStats(id);

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving institution stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
