import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { InstitutionRepository } from '../repositories/InstitutionRepository';
import { Institution } from '../entities';

const institutionRepository = new InstitutionRepository();

class InstitutionController extends BaseController<Institution> {
  constructor() {
    super(institutionRepository);
  }

  public async getStats(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `get stats for institution ${id}` });
  }

  public async getUsers(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `get users for institution ${id}` });
  }

  public async getClasses(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `get classes for institution ${id}` });
  }

  public async getSchedules(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `get schedules for institution ${id}` });
  }

  public async getAnalytics(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `get analytics for institution ${id}` });
  }
}

export default new InstitutionController();