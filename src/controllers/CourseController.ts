import { Request, Response } from 'express';
import { Course } from '../models/Course';

export class CourseController {
  async list(req: Request, res: Response) {
    try {
      const courses = await Course.query()
        .withGraphFetched('[institution, classes]')
        .orderBy('name');

      return res.json(courses);
    } catch (error) {
      console.log('Erro ao listar cursos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await Course.query()
        .findById(id)
        .withGraphFetched('[institution, classes]');

      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      return res.json(course);
    } catch (error) {
      console.log('Erro ao buscar curso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, level, type, active, institution_id } = req.body;

      const course = await Course.query().insert({
        name,
        description,
        level,
        type,
        active: active ?? true,
        institution_id
      });

      return res.status(201).json(course);
    } catch (error) {
      console.log('Erro ao criar curso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, level, type, active, institution_id } = req.body;

      const course = await Course.query()
        .findById(id)
        .patch({
          name,
          description,
          level,
          type,
          active,
          institution_id
        });

      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      return res.json({ message: 'Curso atualizado com sucesso' });
    } catch (error) {
      console.log('Erro ao atualizar curso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await Course.query().deleteById(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      return res.json({ message: 'Curso excluído com sucesso' });
    } catch (error) {
      console.log('Erro ao excluir curso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { query, level, type, institution_id, active } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let queryBuilder = Course.query();

      if (query && typeof query === 'string') {
        queryBuilder = queryBuilder.where('name', 'ilike', `%${query}%`);
      }

      if (level && typeof level === 'string') {
        queryBuilder = queryBuilder.where('level', level);
      }

      if (type && typeof type === 'string') {
        queryBuilder = queryBuilder.where('type', type);
      }

      if (institution_id && typeof institution_id === 'string') {
        queryBuilder = queryBuilder.where('institution_id', institution_id);
      }

      if (active !== undefined && typeof active === 'string') {
        queryBuilder = queryBuilder.where('active', active === 'true');
      }

      const [courses, total] = await Promise.all([
        queryBuilder
          .withGraphFetched('[institution, classes]')
          .orderBy('name')
          .limit(limit)
          .offset(offset),
        queryBuilder.resultSize()
      ]);

      return res.json({
        data: courses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.log('Erro ao buscar cursos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { teacher_id } = req.body;

      const course = await Course.query().findById(id);
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      await course.$relatedQuery('teachers').relate(teacher_id);

      return res.json({ message: 'Professor adicionado com sucesso' });
    } catch (error) {
      console.log('Erro ao adicionar professor:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removeTeacher(req: Request, res: Response) {
    try {
      const { id, teacher_id } = req.params;

      const course = await Course.query().findById(id);
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      await course.$relatedQuery('teachers').unrelate().where('id', teacher_id);

      return res.json({ message: 'Professor removido com sucesso' });
    } catch (error) {
      console.log('Erro ao remover professor:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { student_id } = req.body;

      const course = await Course.query().findById(id);
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      await course.$relatedQuery('students').relate(student_id);

      return res.json({ message: 'Aluno adicionado com sucesso' });
    } catch (error) {
      console.log('Erro ao adicionar aluno:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removeStudent(req: Request, res: Response) {
    try {
      const { id, student_id } = req.params;

      const course = await Course.query().findById(id);
      if (!course) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }

      await course.$relatedQuery('students').unrelate().where('id', student_id);

      return res.json({ message: 'Aluno removido com sucesso' });
    } catch (error) {
      console.log('Erro ao remover aluno:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 