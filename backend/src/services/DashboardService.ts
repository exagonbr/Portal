import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';
import { Course } from '../entities/Course';
import { Institution } from '../entities/Institution';
import { School } from '../entities/School';
import { Class } from '../entities/Class';

export class DashboardService {
  async getSystemDashboard() {
    const userRepository = AppDataSource.getRepository(User);
    const courseRepository = AppDataSource.getRepository(Course);
    const institutionRepository = AppDataSource.getRepository(Institution);
    const schoolRepository = AppDataSource.getRepository(School);
    const classRepository = AppDataSource.getRepository(Class);

    const [
      totalUsers,
      totalCourses,
      totalInstitutions,
      totalSchools,
      totalClasses,
    ] = await Promise.all([
      userRepository.count({ where: { deleted: false } }),
      courseRepository.count({ where: { is_active: true } }),
      institutionRepository.count({ where: { deleted: false } }),
      schoolRepository.count({ where: { deleted: false } }),
      classRepository.count({ where: { is_active: true } }),
    ]);

    return {
      users: { total: totalUsers },
      courses: { total: totalCourses },
      institutions: { total: totalInstitutions },
      schools: { total: totalSchools },
      classes: { total: totalClasses },
    };
  }
}

export default new DashboardService();