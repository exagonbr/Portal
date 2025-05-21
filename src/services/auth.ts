import { User } from '../types/auth';
import { mockStudents, mockTeachers } from '../constants/mockData';

// Mock user storage
let currentUser: User | null = null;

// Fixed test password
const TEST_PASSWORD = 'teste123';

export const authService = {
  login: async ({ email, password }: { email: string; password: string }): Promise<User> => {
    // Verify password
    if (password !== TEST_PASSWORD) {
      throw new Error('Invalid credentials');
    }

    // Mock authentication logic
    const teacher = mockTeachers.find(t => t.email === email);
    if (teacher) {
      currentUser = {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        type: 'teacher',
        courses: teacher.courses
      };
      return currentUser;
    }

    const student = mockStudents.find(s => s.email === email);
    if (student) {
      currentUser = {
        id: student.id,
        name: student.name,
        email: student.email,
        type: 'student',
        courses: student.enrolledCourses
      };
      return currentUser;
    }

    throw new Error('Invalid credentials');
  },

  logout: async (): Promise<void> => {
    currentUser = null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    return currentUser;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    type: 'student' | 'teacher'
  ): Promise<User> => {
    // Mock registration logic
    const newUser: User = {
      id: `${type[0]}${Date.now()}`,
      name,
      email,
      type,
      courses: []
    };
    currentUser = newUser;
    return newUser;
  }
};
