import { Request, Response } from 'express';
import { PermissionsRepository } from '../repositories/PermissionsRepository'
import { Permissions } from '../entities/Permissions';;
import { BaseController } from './BaseController';

export class PermissionsController extends BaseController<Permissions> {
  private permissionsRepository: PermissionsRepository;

  constructor() {
    const repository = new PermissionsRepository();
    super(repository);
    this.permissionsRepository = new PermissionsRepository();
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.permissionsRepository.findAllPaginated({ page, limit, search });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const record = await this.permissionsRepository.findById(parseInt(id));

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
      const record = await this.permissionsRepository.create(data);
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
      
      const record = await this.permissionsRepository.update(parseInt(id), data);
      
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
      const success = await this.permissionsRepository.delete(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Registro não encontrado' });
      }

      return res.status(200).json({ success: true, data: { message: 'Registro deletado com sucesso' } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}
