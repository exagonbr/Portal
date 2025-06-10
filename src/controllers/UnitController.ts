import { Request, Response } from 'express';
import { Unit } from '../models/Unit';

class UnitController {
  async getAllUnits(req: Request, res: Response) {
    try {
      const units = await Unit.query().orderBy('name');
      return res.json(units);
    } catch (error) {
      console.error('Erro ao listar unidades:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const units = await Unit.query()
        .withGraphFetched('institution')
        .orderBy('name');

      return res.json(units);
    } catch (error) {
      console.error('Erro ao listar unidades:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unit = await Unit.query()
        .findById(id)
        .withGraphFetched('institution');

      if (!unit) {
        return res.status(404).json({ error: 'Unidade não encontrada' });
      }

      return res.json(unit);
    } catch (error) {
      console.error('Erro ao buscar unidade:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, type, active, institution_id } = req.body;

      const unit = await Unit.query().insert({
        name,
        description,
        type,
        active: active ?? true,
        institution_id
      });

      return res.status(201).json(unit);
    } catch (error) {
      console.error('Erro ao criar unidade:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, type, active, institution_id } = req.body;

      const unit = await Unit.query()
        .findById(id)
        .patch({
          name,
          description,
          type,
          active,
          institution_id
        });

      if (!unit) {
        return res.status(404).json({ error: 'Unidade não encontrada' });
      }

      return res.json({ message: 'Unidade atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await Unit.query().deleteById(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Unidade não encontrada' });
      }

      return res.json({ message: 'Unidade excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { query, type, institution_id, active } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let queryBuilder = Unit.query();

      if (query) {
        queryBuilder = queryBuilder.where('name', 'ilike', `%${query}%`);
      }

      if (type) {
        queryBuilder = queryBuilder.where('type', type as string);
      }

      if (institution_id) {
        queryBuilder = queryBuilder.where('institution_id', institution_id as string);
      }

      if (active !== undefined) {
        queryBuilder = queryBuilder.where('active', active === 'true');
      }

      const units = await queryBuilder.page(page - 1, limit);

      return res.json({
        data: units.results,
        total: units.total,
        page,
        limit,
        totalPages: Math.ceil(units.total / limit)
      });
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new UnitController();