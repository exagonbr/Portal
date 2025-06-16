import { Request, Response } from 'express';
import { CourseRepository } from '../repositories/CourseRepository';
import { CreateCourseData, UpdateCourseData } from '../models/Course';
import { validationResult } from 'express-validator';

export class CourseController {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 10, search, institution_id, level } = req.query;
      
      let courses;
      
      if (search && typeof search === 'string') {
        courses = await this.courseRepository.searchCourses(search, institution_id as string);
      } else if (institution_id && typeof institution_id === 'string') {
        courses = await this.courseRepository.findByInstitution(institution_id);
      } else if (level && typeof level === 'string') {
        courses = await this.courseRepository.findByLevel(level);
      } else {
        courses = await this.courseRepository.getCoursesWithInstitution();
      }

      return res.json({
        success: true,
        data: courses,
        message: 'Courses retrieved successfully',
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: courses.length
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const course = await this.courseRepository.getCourseWithDetails(id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      return res.json({
        success: true,
        data: course,
        message: 'Course retrieved successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const courseData: CreateCourseData = req.body;
      const course = await this.courseRepository.createCourse(courseData);

      return res.status(201).json({
        success: true,
        data: course,
        message: 'Course created successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const updateData: UpdateCourseData = req.body;

      // Check if course exists
      const existingCourse = await this.courseRepository.findById(id);
      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const course = await this.courseRepository.updateCourse(id, updateData);

      return res.json({
        success: true,
        data: course,
        message: 'Course updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const course = await this.courseRepository.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const deleted = await this.courseRepository.deleteCourse(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete course'
        });
      }

      return res.json({
        success: true,
        data: null,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getModules(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const modules = await this.courseRepository.getCourseModules(id);

      return res.json({
        success: true,
        data: modules,
        message: 'Course modules retrieved successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving course modules',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBooks(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const books = await this.courseRepository.getCourseBooks(id);

      return res.json({
        success: true,
        data: books,
        message: 'Course books retrieved successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving course books',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getVideos(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const videos = await this.courseRepository.getCourseVideos(id);

      return res.json({
        success: true,
        data: videos,
        message: 'Course videos retrieved successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving course videos',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTeachers(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const teachers = await this.courseRepository.getCourseTeachers(id);

      return res.json({
        success: true,
        data: teachers,
        message: 'Course teachers retrieved successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving course teachers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getStudents(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const students = await this.courseRepository.getCourseStudents(id);

      return res.json({
        success: true,
        data: students,
        message: 'Course students retrieved successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving course students',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addTeacher(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      await this.courseRepository.addTeacherToCourse(id, userId);

      return res.json({
        success: true,
        data: null,
        message: 'Teacher added to course successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error adding teacher to course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async removeTeacher(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const removed = await this.courseRepository.removeTeacherFromCourse(id, userId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found in course'
        });
      }

      return res.json({
        success: true,
        data: null,
        message: 'Teacher removed from course successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error removing teacher from course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addStudent(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      await this.courseRepository.addStudentToCourse(id, userId);

      return res.json({
        success: true,
        data: null,
        message: 'Student added to course successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error adding student to course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async removeStudent(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const removed = await this.courseRepository.removeStudentFromCourse(id, userId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Student not found in course'
        });
      }

      return res.json({
        success: true,
        message: 'Student removed from course successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error removing student from course',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateStudentProgress(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params;
      const { progress, grades } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      if (progress === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Progress is required'
        });
      }

      await this.courseRepository.updateStudentProgress(id, userId, progress, grades);

      return res.json({
        success: true,
        message: 'Student progress updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating student progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getCoursesByTeacher(teacherId: string): Promise<any[]> {
    try {
      const courses = await this.courseRepository.getCoursesByTeacher(teacherId);
      return courses;
    } catch (error) {
      console.error(`Error retrieving teacher courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to retrieve teacher courses');
    }
  }

  async getCoursesByStudent(studentId: string): Promise<any[]> {
    try {
      const courses = await this.courseRepository.getCoursesByStudent(studentId);
      return courses;
    } catch (error) {
      console.error(`Error retrieving student courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to retrieve student courses');
    }
  }
}
