import { Request, Response } from 'express';
import { CourseRepository } from '../repositories/CourseRepository';
import { Course } from '../entities/Course';
import { BaseController } from './BaseController';

const courseRepository = new CourseRepository();

class CourseController extends BaseController<Course> {
  constructor() {
    super(courseRepository);
  }

  // Métodos específicos para Course, se necessário
  public async getStudents(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const students = await courseRepository.getStudents(id);
      return res.status(200).json({ success: true, data: students });
    } catch (error) {
      console.error(`Error in getStudents: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async addStudent(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { studentId } = req.body;
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'studentId is required' });
      }
      await courseRepository.addStudent(id, studentId);
      return res.status(200).json({ success: true, message: 'Student added successfully' });
    } catch (error) {
      console.error(`Error in addStudent: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async removeStudent(req: Request, res: Response): Promise<Response> {
    try {
      const { id, studentId } = req.params;
      const success = await courseRepository.removeStudent(id, studentId);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Student not found in this course' });
      }
      return res.status(200).json({ success: true, message: 'Student removed successfully' });
    } catch (error) {
      console.error(`Error in removeStudent: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async toggleStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    // A lógica real para alterar o status estaria aqui.
    console.log(`Toggling status for course ${id}`);
    return res.status(200).json({ success: true, message: `Status for course ${id} toggled.` });
  }
}

export default new CourseController();