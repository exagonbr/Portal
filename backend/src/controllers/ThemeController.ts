import { Request, Response } from 'express';
import { ThemeRepository } from '../repositories/ThemeRepository';
import BaseController from './BaseController';
import { Theme } from '../entities/Theme';

export class ThemeController extends BaseController<Theme> {
  private themeRepository: ThemeRepository;

  constructor() {
    const repository = new ThemeRepository();
    super(repository);
    this.themeRepository = repository;
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const theme = await this.themeRepository.toggleStatus(id);
      if (!theme) {
        return res.status(404).json({ success: false, message: 'Theme not found' });
      }
      return res.status(200).json({ success: true, data: theme });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
      }
      
      const themes = await this.themeRepository.findByName(q as string);
      return res.status(200).json({ success: true, data: themes });
    } catch (error) {
      console.error(`Error in search themes: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const themes = await this.themeRepository.findActive();
      return res.status(200).json({ success: true, data: themes });
    } catch (error) {
      console.error(`Error in getActive: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new ThemeController();
