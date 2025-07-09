import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Quiz } from '../entities/Quiz';
import { QuizRepository } from '../repositories/QuizRepository';

class QuizController extends BaseController<Quiz> {
  private quizRepository: QuizRepository;

  constructor() {
    const repository = new QuizRepository();
    super(repository);
    this.quizRepository = repository;
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    return res.json({ success: true, data: { message: `getAll quizzes with query ${JSON.stringify(req.query)}` } });
  }

  async getById(req: Request, res: Response): Promise<Response> {
    return res.json({ success: true, data: { message: `get quiz by id ${req.params.id}` } });
  }

  async create(req: Request, res: Response): Promise<Response> {
    return res.status(201).json({ success: true, data: { message: 'create quiz', data: req.body } });
  }

  async update(req: Request, res: Response): Promise<Response> {
    return res.json({ success: true, data: { message: `update quiz ${req.params.id}`, data: req.body } });
  }

  async delete(req: Request, res: Response): Promise<Response> {
    return res.status(204).json({ success: true, message: 'Quiz deleted successfully' });
  }
}

export default new QuizController();
