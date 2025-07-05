import { Request, Response } from 'express';

class ModuleController {
    async getAll(req: Request, res: Response) {
        res.json({ message: `getAll modules with query ${JSON.stringify(req.query)}` });
    }

    async getById(req: Request, res: Response) {
        res.json({ message: `get module by id ${req.params.id}` });
    }

    async create(req: Request, res: Response) {
        res.status(201).json({ message: 'create module', data: req.body });
    }

    async update(req: Request, res: Response) {
        res.json({ message: `update module ${req.params.id}`, data: req.body });
    }

    async delete(req: Request, res: Response) {
        res.status(204).send();
    }
}

export default new ModuleController();