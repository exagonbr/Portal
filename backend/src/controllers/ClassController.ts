import { Request, Response } from 'express';
import BaseController from './BaseController';
import { Class } from '../entities/Class';
import { ClassRepository } from '../repositories/ClassRepository';

class ClassController extends BaseController<Class> {
  private classRepository: ClassRepository;

  constructor() {
    const repository = new ClassRepository();
    super(repository);
    this.classRepository = repository;
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const classEntity = await this.classRepository.toggleStatus(id);
      if (!classEntity) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }
      return res.status(200).json({ success: true, data: classEntity });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new ClassController();
