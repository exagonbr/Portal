import { Request, Response } from 'express';
import { Institution } from '../models/Institution';

export class InstitutionController {
  async list(req: Request, res: Response) {
    try {
      const institutions = await Institution.query()
        .withGraphFetched('[units, courses]')
        .orderBy('name');

      return res.json(institutions);
    } catch (error) {
      console.log('Erro ao listar instituições:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const institution = await Institution.query()
        .findById(id)
        .withGraphFetched('[units, courses]');

      if (!institution) {
        return res.status(404).json({ error: 'Instituição não encontrada' });
      }

      return res.json(institution);
    } catch (error) {
      console.log('Erro ao buscar instituição:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, type, active } = req.body;

      const institution = await Institution.query().insert({
        name,
        description,
        type,
        active: active ?? true
      });

      return res.status(201).json(institution);
    } catch (error) {
      console.log('Erro ao criar instituição:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, type, active } = req.body;

      const institution = await Institution.query()
        .findById(id)
        .patch({
          name,
          description,
          type,
          active
        });

      if (!institution) {
        return res.status(404).json({ error: 'Instituição não encontrada' });
      }

      return res.json({ message: 'Instituição atualizada com sucesso' });
    } catch (error) {
      console.log('Erro ao atualizar instituição:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await Institution.query().deleteById(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Instituição não encontrada' });
      }

      return res.json({ message: 'Instituição excluída com sucesso' });
    } catch (error) {
      console.log('Erro ao excluir instituição:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { query, type, active } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let queryBuilder = Institution.query();

      if (query && typeof query === 'string') {
        queryBuilder = queryBuilder.where('name', 'ilike', `%${query}%`);
      }

      if (type && typeof type === 'string') {
        queryBuilder = queryBuilder.where('type', type);
      }

      if (active !== undefined && typeof active === 'string') {
        queryBuilder = queryBuilder.where('active', active === 'true');
      }

      const [institutions, total] = await Promise.all([
        queryBuilder
          .withGraphFetched('[units, courses]')
          .orderBy('name')
          .limit(limit)
          .offset(offset),
        queryBuilder.resultSize()
      ]);

      return res.json({
        data: institutions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.log('Erro ao buscar instituições:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}