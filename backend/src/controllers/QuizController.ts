import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Quiz } from '../entities/Quiz';
import { QuizRepository } from '../repositories/QuizRepository';

const quizRepository = new QuizRepository();

class QuizController extends BaseController<Quiz> {
    constructor() {
        super(quizRepository);
    }

    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll quizzes with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get quiz by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create quiz', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update quiz ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new QuizController();