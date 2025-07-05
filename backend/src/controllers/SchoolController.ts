import { Request, Response } from 'express';
class SchoolController {

  public async toggleStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    // A lógica real para alterar o status estaria aqui.
    console.log(`Toggling status for school ${id}`);
    return res.status(200).json({ success: true, message: `Status for school ${id} toggled.` });
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

export default new SchoolController();