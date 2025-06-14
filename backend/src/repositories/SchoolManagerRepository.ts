import { 
  SchoolManager, 
  CreateSchoolManagerData, 
  UpdateSchoolManagerData 
} from '../models/SchoolManager';
import { 
  SchoolManagerFilterDto, 
  PaginatedSchoolManagersDto,
  SchoolManagerWithDetailsDto,
  SchoolManagementTeamDto,
  ManagerHistoryDto
} from '../dto/SchoolManagerDto';
import { BaseRepository } from './BaseRepository';

export class SchoolManagerRepository extends BaseRepository<SchoolManager> {
  constructor() {
    super('school_managers');
  }

  override async create(data: CreateSchoolManagerData): Promise<SchoolManager> {
    const [manager] = await this.db(this.tableName)
      .insert({
        ...data,
        start_date: data.start_date || new Date(),
        is_active: data.is_active ?? true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return manager;
  }

  override async update(id: string, data: UpdateSchoolManagerData): Promise<SchoolManager | null> {
    const [manager] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return manager || null;
  }

  async findByUserAndSchool(userId: string, schoolId: string): Promise<SchoolManager[]> {
    return await this.db(this.tableName)
      .where({ user_id: userId, school_id: schoolId })
      .orderBy('start_date', 'desc');
  }

  async findActiveBySchool(schoolId: string): Promise<SchoolManager[]> {
    return await this.db(this.tableName)
      .where({ school_id: schoolId, is_active: true })
      .orderBy('position')
      .orderBy('start_date');
  }

  async findActiveByUser(userId: string): Promise<SchoolManager[]> {
    return await this.db(this.tableName)
      .where({ user_id: userId, is_active: true })
      .orderBy('start_date', 'desc');
  }

  async findWithPagination(filter: SchoolManagerFilterDto): Promise<PaginatedSchoolManagersDto> {
    const { 
      page = 1, 
      limit = 10, 
      user_id, 
      school_id, 
      position, 
      is_active,
      institution_id,
      sortBy = 'start_date', 
      sortOrder = 'desc' 
    } = filter;
    const offset = (page - 1) * limit;

    let query = this.db(this.tableName);
    let countQuery = this.db(this.tableName);

    // Aplicar filtros
    if (user_id) {
      query = query.where('school_managers.user_id', user_id);
      countQuery = countQuery.where('school_managers.user_id', user_id);
    }

    if (school_id) {
      query = query.where('school_managers.school_id', school_id);
      countQuery = countQuery.where('school_managers.school_id', school_id);
    }

    if (position) {
      query = query.where('school_managers.position', position);
      countQuery = countQuery.where('school_managers.position', position);
    }

    if (is_active !== undefined) {
      query = query.where('school_managers.is_active', is_active);
      countQuery = countQuery.where('school_managers.is_active', is_active);
    }

    // Filtro por instituição requer join
    if (institution_id) {
      query = query
        .join('schools', 'school_managers.school_id', 'schools.id')
        .where('schools.institution_id', institution_id);
      countQuery = countQuery
        .join('schools', 'school_managers.school_id', 'schools.id')
        .where('schools.institution_id', institution_id);
    }

    // Obter total
    const countResult = await countQuery.count('* as count').first();
    const total = parseInt(countResult?.count as string, 10) || 0;

    // Obter dados paginados
    const school_managers = await query
      .select('school_managers.*')
      .orderBy(`school_managers.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      school_managers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async getWithDetails(managerId: string): Promise<SchoolManagerWithDetailsDto | null> {
    const result = await this.db(this.tableName)
      .select(
        'school_managers.*',
        'User.name as user_name',
        'User.email as user_email',
        'schools.name as school_name',
        'schools.code as school_code',
        'institutions.name as institution_name',
        'institutions.id as institution_id'
      )
      .join('User', 'school_managers.user_id', 'User.id')
      .join('schools', 'school_managers.school_id', 'schools.id')
      .join('institutions', 'schools.institution_id', 'institutions.id')
      .where('school_managers.id', managerId)
      .first();

    return result || null;
  }

  async getSchoolManagementTeam(schoolId: string): Promise<SchoolManagementTeamDto> {
    const schoolInfo = await this.db('schools')
      .where({ id: schoolId })
      .first();

    if (!schoolInfo) {
      throw new Error('Escola não encontrada');
    }

    // Obter todos os gestores ativos
    const managers = await this.db(this.tableName)
      .select(
        'school_managers.*',
        'User.name as user_name',
        'User.email as user_email'
      )
      .join('User', 'school_managers.user_id', 'User.id')
      .where('school_managers.school_id', schoolId)
      .where('school_managers.is_active', true)
      .orderBy('school_managers.position');

    // Organizar por cargo
    const team: any = {
      school_id: schoolId,
      school_name: schoolInfo.name,
      managers: managers.map(m => ({
        id: m.id,
        user_id: m.user_id,
        user_name: m.user_name,
        user_email: m.user_email,
        position: m.position,
        start_date: m.start_date,
        end_date: m.end_date,
        is_active: m.is_active
      })),
      vice_principals: [],
      coordinators: [],
      supervisors: []
    };

    // Separar por cargo
    for (const manager of managers) {
      const managerDetails: SchoolManagerWithDetailsDto = {
        ...manager,
        school_name: schoolInfo.name,
        school_code: schoolInfo.code,
        institution_name: '', // Seria necessário outro join para pegar
        institution_id: schoolInfo.institution_id
      };

      switch (manager.position) {
        case 'PRINCIPAL':
          team.principal = managerDetails;
          break;
        case 'VICE_PRINCIPAL':
          team.vice_principals.push(managerDetails);
          break;
        case 'COORDINATOR':
          team.coordinators.push(managerDetails);
          break;
        case 'SUPERVISOR':
          team.supervisors.push(managerDetails);
          break;
      }
    }

    return team as SchoolManagementTeamDto;
  }

  async getManagerHistory(userId: string): Promise<ManagerHistoryDto> {
            const userInfo = await this.db('users')
      .where({ id: userId })
      .first();

    if (!userInfo) {
      throw new Error('Usuário não encontrado');
    }

    const positions = await this.db(this.tableName)
      .select(
        'school_managers.*',
        'schools.name as school_name',
        'institutions.name as institution_name'
      )
      .join('schools', 'school_managers.school_id', 'schools.id')
      .join('institutions', 'schools.institution_id', 'institutions.id')
      .where('school_managers.user_id', userId)
      .orderBy('school_managers.start_date', 'desc');

    return {
      user_id: userId,
      user_name: userInfo.name,
      positions: positions.map(p => ({
        school_id: p.school_id,
        school_name: p.school_name,
        institution_name: p.institution_name,
        position: p.position,
        start_date: p.start_date,
        end_date: p.end_date,
        is_active: p.is_active
      }))
    };
  }

  async deactivateManager(userId: string, schoolId: string, position: string): Promise<boolean> {
    const updated = await this.db(this.tableName)
      .where({ user_id: userId, school_id: schoolId, position })
      .update({
        is_active: false,
        end_date: new Date(),
        updated_at: new Date()
      });

    return updated > 0;
  }

  async checkPositionAvailable(schoolId: string, position: string, excludeUserId?: string): Promise<boolean> {
    // Algumas posições podem ter múltiplos ocupantes
    const singlePositions = ['PRINCIPAL'];
    
    if (!singlePositions.includes(position)) {
      return true; // Posições que permitem múltiplos ocupantes
    }

    let query = this.db(this.tableName)
      .where({ school_id: schoolId, position, is_active: true });
    
    if (excludeUserId) {
      query = query.whereNot({ user_id: excludeUserId });
    }

    const existing = await query.first();
    return !existing;
  }

  async checkManagerExists(userId: string, schoolId: string, position: string): Promise<boolean> {
    const existing = await this.db(this.tableName)
      .where({ user_id: userId, school_id: schoolId, position })
      .first();
    
    return !!existing;
  }
}