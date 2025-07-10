import { Request, Response } from 'express';
import { BaseRepository } from '../repositories/BaseRepository';

class BaseController<T extends { id: string | number }> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const items = await this.repository.findAll();
      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      console.error(`Error in getAll: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const item = await this.repository.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      console.error(`Error in getById: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const newItem = await this.repository.create(req.body);
      return res.status(201).json({ success: true, data: newItem, message: 'Item created successfully' });
    } catch (error) {
      console.error(`Error in create: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updatedItem = await this.repository.update(id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.status(200).json({ success: true, data: updatedItem, message: 'Item updated successfully' });
    } catch (error) {
      console.error(`Error in update: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const success = await this.repository.delete(id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      return res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
      console.error(`Error in delete: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  // Métodos auxiliares para as classes filhas
  protected success(res: Response, data: any, status: number = 200): void {
    res.status(status).json({ success: true, data });
  }

  protected error(res: Response, error: any, status: number = 500): void {
    console.error(error);
    res.status(status).json({ success: false, message: 'Erro interno do servidor' });
  }

  protected notFound(res: Response, message: string = 'Recurso não encontrado'): void {
    res.status(404).json({ success: false, message });
  }
}
export default BaseController;
