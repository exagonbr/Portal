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

    // Obter contagem de usuários por função usando strings para evitar problemas de tipagem
    const usersByRole = {
      STUDENT: await userRepository.createQueryBuilder('user')
        .where('user.role = :role AND user.deleted = :deleted', { role: 'STUDENT', deleted: false })
        .getCount(),
      TEACHER: await userRepository.createQueryBuilder('user')
        .where('user.role = :role AND user.deleted = :deleted', { role: 'TEACHER', deleted: false })
        .getCount(),
      COORDINATOR: await userRepository.createQueryBuilder('user')
        .where('user.role = :role AND user.deleted = :deleted', { role: 'ACADEMIC_COORDINATOR', deleted: false })
        .getCount(),
      ADMIN: await userRepository.createQueryBuilder('user')
        .where('user.role = :role AND user.deleted = :deleted', { role: 'INSTITUTION_MANAGER', deleted: false })
        .getCount(),
      PARENT: await userRepository.createQueryBuilder('user')
        .where('user.role = :role AND user.deleted = :deleted', { role: 'GUARDIAN', deleted: false })
        .getCount(),
      SYSTEM_ADMIN: await userRepository.createQueryBuilder('user')
        .where('user.role = :role AND user.deleted = :deleted', { role: 'SYSTEM_ADMIN', deleted: false })
        .getCount()
    };

    return {
      users: { total: totalUsers },
      courses: { total: totalCourses },
      institutions: { total: totalInstitutions },
      schools: { total: totalSchools },
      classes: { total: totalClasses },
      users_by_role: usersByRole
    };
  }
}

export default new DashboardService();