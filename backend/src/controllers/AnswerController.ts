import { Request, Response } from 'express';
import { AnswerService } from '../services/AnswerService';
import { CreateAnswerDto, UpdateAnswerDto, AnswerFilterDto } from '../dto/AnswerDto';
import { AnswerRepository } from '../repositories/AnswerRepository';
import BaseController from './BaseController';
import { Answer } from '../entities/Answer';

export class AnswerController extends BaseController<Answer> {
  private answerService: AnswerService;
  private answerRepository: AnswerRepository;

  constructor() {
    const repository = new AnswerRepository();
    super(repository);
    this.answerRepository = repository;
    this.answerService = new AnswerService();
  }

  // GET /api/answers
  async findAll(req: Request, res: Response) {
    try {
      const filters: AnswerFilterDto = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        deleted: req.query.deleted === 'true' ? true : req.query.deleted === 'false' ? false : undefined,
        questionId: req.query.questionId ? parseInt(req.query.questionId as string) : undefined,
        isCorrect: req.query.isCorrect === 'true' ? true : req.query.isCorrect === 'false' ? false : undefined
      };

      const result = await this.answerService.getAllAnswers(filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in AnswerController.findAll:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/answers/:id
  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid answer ID'
        });
      }

      const result = await this.answerService.getAnswerById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in AnswerController.findById:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // POST /api/answers
  async create(req: Request, res: Response) {
    try {
      const answerData: CreateAnswerDto = req.body;

      const result = await this.answerService.createAnswer(answerData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error in AnswerController.create:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // PUT /api/answers/:id
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const answerData: UpdateAnswerDto = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid answer ID'
        });
      }

      const result = await this.answerService.updateAnswer(id, answerData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in AnswerController.update:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // DELETE /api/answers/:id
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid answer ID'
        });
      }

      const result = await this.answerService.deleteAnswer(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in AnswerController.delete:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new AnswerController();
