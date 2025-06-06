import { Request, Response } from 'express';
import { Class } from '../models/Class';

export class ClassController {
  async list(req: Request, res: Response) {
    try {
      const classes = await Class.query()
        .withGraphFetched('[course, teacher, students]')
        .orderBy('name');

      return res.json(classes);
    } catch (error) {
      console.error('Erro ao listar turmas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const classData = await Class.query()
        .findById(id)
        .withGraphFetched('[course, teacher, students]');

      if (!classData) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      return res.json(classData);
    } catch (error) {
      console.error('Erro ao buscar turma:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, status, active, course_id, teacher_id } = req.body;

      const classData = await Class.query().insert({
        name,
        description,
        status,
        active: active ?? true,
        course_id,
        teacher_id
      });

      return res.status(201).json(classData);
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, status, active, course_id, teacher_id } = req.body;

      const classData = await Class.query()
        .findById(id)
        .patch({
          name,
          description,
          status,
          active,
          course_id,
          teacher_id
        });

      if (!classData) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      return res.json({ message: 'Turma atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await Class.query().deleteById(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      return res.json({ message: 'Turma excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { query, status, course_id, teacher_id, active } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let queryBuilder = Class.query();

      if (query) {
        queryBuilder = queryBuilder.where('name', 'ilike', `%${query}%`);
      }

      if (status) {
        queryBuilder = queryBuilder.where('status', status);
      }

      if (course_id) {
        queryBuilder = queryBuilder.where('course_id', course_id);
      }

      if (teacher_id) {
        queryBuilder = queryBuilder.where('teacher_id', teacher_id);
      }

      if (active !== undefined) {
        queryBuilder = queryBuilder.where('active', active === 'true');
      }

      const [classes, total] = await Promise.all([
        queryBuilder
          .withGraphFetched('[course, teacher, students]')
          .orderBy('name')
          .limit(limit)
          .offset(offset),
        queryBuilder.resultSize()
      ]);

      return res.json({
        data: classes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { student_id } = req.body;

      const classData = await Class.query().findById(id);
      if (!classData) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      await classData.$relatedQuery('students').relate(student_id);

      return res.json({ message: 'Aluno adicionado com sucesso' });
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removeStudent(req: Request, res: Response) {
    try {
      const { id, student_id } = req.params;

      const classData = await Class.query().findById(id);
      if (!classData) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      await classData.$relatedQuery('students').unrelate().where('id', student_id);

      return res.json({ message: 'Aluno removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { teacher_id } = req.body;

      const classData = await Class.query().findById(id);
      if (!classData) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      await classData.$relatedQuery('teacher').relate(teacher_id);

      return res.json({ message: 'Professor adicionado com sucesso' });
    } catch (error) {
      console.error('Erro ao adicionar professor:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removeTeacher(req: Request, res: Response) {
    try {
      const { id, teacher_id } = req.params;

      const classData = await Class.query().findById(id);
      if (!classData) {
        return res.status(404).json({ error: 'Turma não encontrada' });
      }

      await classData.$relatedQuery('teacher').unrelate().where('id', teacher_id);

      return res.json({ message: 'Professor removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover professor:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 