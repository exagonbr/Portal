import { BaseService } from '../common/BaseService';
import { RoleRepository } from '../repositories/RoleRepository';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  RoleFilterDto, 
  RoleResponseDto,
  RoleStatsDto,
  ExtendedRoleDto,
  CustomRoleDto,
  RolePermissionGroupDto} from '../dto/RoleDto';
import { ServiceResult } from '../types/common';
import db from '../config/database';
import { getRedisClient, TTL } from '../config/redis';
import { Logger } from '../utils/Logger';

interface RoleEntity {
  id: string;
  name: string;
  description?: string;
  type: 'system' | 'custom';
  status: 'active' | 'inactive';
  user_count?: number;
  created_at: Date;
  updated_at: Date;
}

export class RoleService extends BaseService<RoleEntity, CreateRoleDto, UpdateRoleDto> {
  
  private readonly redis = getRedisClient();
  protected readonly logger = new Logger('RoleService');
  
  // Mapeamento das permissões do banco para o formato do frontend
  private readonly PERMISSION_MAPPING: { [key: string]: string } = {
    'system.manage': 'canManageSystem',
    'institutions.manage': 'canManageInstitutions',
    'users.manage.global': 'canManageGlobalUsers',
    'analytics.view.system': 'canViewSystemAnalytics',
    'security.manage': 'canManageSecurityPolicies',
    'schools.manage': 'canManageSchools',
    'users.manage.institution': 'canManageInstitutionUsers',
    'classes.manage': 'canManageClasses',
    'schedules.manage': 'canManageSchedules',
    'analytics.view.institution': 'canViewInstitutionAnalytics',
    'cycles.manage': 'canManageCycles',
    'curriculum.manage': 'canManageCurriculum',
    'teachers.monitor': 'canMonitorTeachers',
    'analytics.view.academic': 'canViewAcademicAnalytics',
    'departments.coordinate': 'canCoordinateDepartments',
    'attendance.manage': 'canManageAttendance',
    'grades.manage': 'canManageGrades',
    'lessons.manage': 'canManageLessonPlans',
    'resources.upload': 'canUploadResources',
    'students.communicate': 'canCommunicateWithStudents',
    'guardians.communicate': 'canCommunicateWithGuardians',
    'schedule.view.own': 'canViewOwnSchedule',
    'grades.view.own': 'canViewOwnGrades',
    'materials.access': 'canAccessLearningMaterials',
    'assignments.submit': 'canSubmitAssignments',
    'progress.track.own': 'canTrackOwnProgress',
    'teachers.message': 'canMessageTeachers',
    'children.view.info': 'canViewChildrenInfo',
    'children.view.grades': 'canViewChildrenGrades',
    'children.view.attendance': 'canViewChildrenAttendance',
    'children.view.assignments': 'canViewChildrenAssignments',
    'announcements.receive': 'canReceiveAnnouncements',
    'school.communicate': 'canCommunicateWithSchool',
    'meetings.schedule': 'canScheduleMeetings'
  };

  private readonly PERMISSION_GROUPS: RolePermissionGroupDto[] = [
    {
      id: 'system_management',
      name: 'Gestão do Sistema',
      description: 'Permissões administrativas do sistema',
      permissions: [
        { key: 'canManageSystem', name: 'Gerenciar Sistema', description: 'Acesso total às configurações do sistema', category: 'Sistema', value: false },
        { key: 'canManageInstitutions', name: 'Gerenciar Instituições', description: 'Criar, editar e remover instituições', category: 'Sistema', value: false },
        { key: 'canManageGlobalUsers', name: 'Gerenciar Usuários Globais', description: 'Administrar usuários em todas as instituições', category: 'Sistema', value: false },
        { key: 'canViewSystemAnalytics', name: 'Visualizar Análises do Sistema', description: 'Acessar relatórios e métricas globais', category: 'Sistema', value: false },
        { key: 'canManageSecurityPolicies', name: 'Gerenciar Políticas de Segurança', description: 'Configurar políticas de segurança e acesso', category: 'Sistema', value: false }
      ]
    },
    {
      id: 'institution_management',
      name: 'Gestão Institucional',
      description: 'Administração de escolas e unidades',
      permissions: [
        { key: 'canManageSchools', name: 'Gerenciar Escolas', description: 'Administrar escolas e unidades de ensino', category: 'Instituição', value: false },
        { key: 'canManageInstitutionUsers', name: 'Gerenciar Usuários da Instituição', description: 'Administrar usuários dentro da instituição', category: 'Instituição', value: false },
        { key: 'canManageClasses', name: 'Gerenciar Turmas', description: 'Criar e administrar turmas e classes', category: 'Instituição', value: false },
        { key: 'canManageSchedules', name: 'Gerenciar Horários', description: 'Configurar horários e grade curricular', category: 'Instituição', value: false },
        { key: 'canViewInstitutionAnalytics', name: 'Visualizar Análises Institucionais', description: 'Acessar relatórios da instituição', category: 'Instituição', value: false }
      ]
    },
    {
      id: 'academic_management',
      name: 'Gestão Acadêmica',
      description: 'Coordenação pedagógica e curricular',
      permissions: [
        { key: 'canManageCycles', name: 'Gerenciar Ciclos Educacionais', description: 'Administrar períodos letivos e ciclos', category: 'Acadêmico', value: false },
        { key: 'canManageCurriculum', name: 'Gerenciar Currículo', description: 'Definir e modificar estrutura curricular', category: 'Acadêmico', value: false },
        { key: 'canMonitorTeachers', name: 'Monitorar Professores', description: 'Supervisionar atividades docentes', category: 'Acadêmico', value: false },
        { key: 'canViewAcademicAnalytics', name: 'Visualizar Análises Acadêmicas', description: 'Acessar métricas de desempenho acadêmico', category: 'Acadêmico', value: false },
        { key: 'canCoordinateDepartments', name: 'Coordenar Departamentos', description: 'Gerenciar departamentos e coordenações', category: 'Acadêmico', value: false }
      ]
    },
    {
      id: 'teaching',
      name: 'Ensino',
      description: 'Atividades de ensino e avaliação',
      permissions: [
        { key: 'canManageAttendance', name: 'Gerenciar Presença', description: 'Registrar e controlar frequência dos alunos', category: 'Ensino', value: false },
        { key: 'canManageGrades', name: 'Gerenciar Notas', description: 'Lançar e editar notas dos alunos', category: 'Ensino', value: false },
        { key: 'canManageLessonPlans', name: 'Gerenciar Planos de Aula', description: 'Criar e modificar planos de aula', category: 'Ensino', value: false },
        { key: 'canUploadResources', name: 'Enviar Recursos', description: 'Fazer upload de materiais didáticos', category: 'Ensino', value: false },
        { key: 'canCommunicateWithStudents', name: 'Comunicar com Alunos', description: 'Enviar mensagens e comunicados para alunos', category: 'Ensino', value: false },
        { key: 'canCommunicateWithGuardians', name: 'Comunicar com Responsáveis', description: 'Comunicar-se com pais e responsáveis', category: 'Ensino', value: false }
      ]
    },
    {
      id: 'student_access',
      name: 'Acesso do Aluno',
      description: 'Funcionalidades para estudantes',
      permissions: [
        { key: 'canViewOwnSchedule', name: 'Visualizar Próprio Horário', description: 'Acessar horário pessoal de aulas', category: 'Aluno', value: false },
        { key: 'canViewOwnGrades', name: 'Visualizar Próprias Notas', description: 'Consultar notas e avaliações próprias', category: 'Aluno', value: false },
        { key: 'canAccessLearningMaterials', name: 'Acessar Materiais de Aprendizagem', description: 'Baixar e visualizar conteúdo educacional', category: 'Aluno', value: false },
        { key: 'canSubmitAssignments', name: 'Enviar Tarefas', description: 'Submeter trabalhos e atividades', category: 'Aluno', value: false },
        { key: 'canTrackOwnProgress', name: 'Acompanhar Próprio Progresso', description: 'Visualizar evolução acadêmica pessoal', category: 'Aluno', value: false },
        { key: 'canMessageTeachers', name: 'Enviar Mensagens para Professores', description: 'Comunicar-se com docentes', category: 'Aluno', value: false }
      ]
    },
    {
      id: 'guardian_access',
      name: 'Acesso do Responsável',
      description: 'Funcionalidades para pais e responsáveis',
      permissions: [
        { key: 'canViewChildrenInfo', name: 'Visualizar Informações dos Filhos', description: 'Acessar dados gerais dos dependentes', category: 'Responsável', value: false },
        { key: 'canViewChildrenGrades', name: 'Visualizar Notas dos Filhos', description: 'Consultar desempenho acadêmico dos dependentes', category: 'Responsável', value: false },
        { key: 'canViewChildrenAttendance', name: 'Visualizar Presença dos Filhos', description: 'Acompanhar frequência dos dependentes', category: 'Responsável', value: false },
        { key: 'canViewChildrenAssignments', name: 'Visualizar Tarefas dos Filhos', description: 'Acompanhar atividades e trabalhos', category: 'Responsável', value: false },
        { key: 'canReceiveAnnouncements', name: 'Receber Comunicados', description: 'Receber avisos e informações da escola', category: 'Responsável', value: false },
        { key: 'canCommunicateWithSchool', name: 'Comunicar com a Escola', description: 'Entrar em contato com a instituição', category: 'Responsável', value: false },
        { key: 'canScheduleMeetings', name: 'Agendar Reuniões', description: 'Marcar encontros com professores e coordenação', category: 'Responsável', value: false }
      ]
    },
    {
      id: 'financial_access',
      name: 'Acesso Financeiro',
      description: 'Informações financeiras e pagamentos',
      permissions: [
        { key: 'canViewFinancialInfo', name: 'Visualizar Informações Financeiras', description: 'Acessar dados financeiros básicos', category: 'Financeiro', value: false },
        { key: 'canViewPayments', name: 'Visualizar Pagamentos', description: 'Consultar histórico de pagamentos', category: 'Financeiro', value: false },
        { key: 'canViewBoletos', name: 'Visualizar Boletos', description: 'Acessar boletos e cobranças', category: 'Financeiro', value: false },
        { key: 'canViewFinancialHistory', name: 'Visualizar Histórico Financeiro', description: 'Consultar histórico financeiro completo', category: 'Financeiro', value: false }
      ]
    }
  ];

  constructor() {
    const roleRepository = new RoleRepository();
    super(roleRepository, 'Role');
  }

  /**
   * Busca todos os roles com filtros e paginação
   */
  async findRolesWithFilters(filters: RoleFilterDto): Promise<ServiceResult<{ roles: RoleResponseDto[], pagination: any }>> {
    try {
      const { page = 1, limit = 10, type, status, search, sortBy = 'name', sortOrder = 'asc', active } = filters;
      
      // Validar parâmetros de ordenação
      const validSortFields = ['name', 'created_at', 'updated_at', 'user_count'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sortBy)) {
        return {
          success: false,
          error: `Campo de ordenação inválido. Valores permitidos: ${validSortFields.join(', ')}`
        };
      }
      
      if (!validSortOrders.includes(sortOrder)) {
        return {
          success: false,
          error: `Ordem de ordenação inválida. Valores permitidos: ${validSortOrders.join(', ')}`
        };
      }
      
      // Gerar chave de cache baseada nos filtros
      const cacheKey = `portal_sabercon:roles:list:${JSON.stringify(filters)}`;
      
      // Tentar obter do cache primeiro
      try {
        const cachedData = await this.redis.get(cacheKey);
        if (cachedData) {
          this.logger.info(`Cache hit para roles: ${cacheKey}`);
          const parsedData = JSON.parse(cachedData);
          return {
            success: true,
            data: parsedData
          };
        }
        this.logger.info(`Cache miss para roles: ${cacheKey}`);
      } catch (error) {
        const cacheError = error as Error;
        this.logger.error(`Erro ao acessar cache para roles: ${cacheError.message}`, { filters }, cacheError);
      }
      
      // Continuar com a consulta ao banco de dados
      const offset = (page - 1) * limit;

      let query = db('roles as r')
        .select([
          'r.*',
          db.raw('COUNT(DISTINCT u.id) as user_count')
        ])
        .leftJoin('User as u', 'u.role_id', 'r.id')
        .groupBy('r.id');

      // Aplicar filtros
      if (type) {
        query = query.where('r.type', type);
      }

      if (status) {
        query = query.where('r.status', status);
      } else if (active !== undefined) {
        // Se active está definido, use-o para filtrar (true = 'active', false = 'inactive')
        const statusValue = active === true ? 'active' : 'inactive';
        query = query.where('r.status', statusValue);
      }

      if (search) {
        query = query.where(function() {
          this.where('r.name', 'ilike', `%${search}%`)
              .orWhere('r.description', 'ilike', `%${search}%`);
        });
      }

      // Contar total
      const countQuery = db('roles').count('* as count');
      if (type) countQuery.where('type', type);
      if (status) {
        countQuery.where('status', status);
      } else if (active !== undefined) {
        const statusValue = active === true ? 'active' : 'inactive';
        countQuery.where('status', statusValue);
      }
      if (search) {
        countQuery.where(function() {
          this.where('name', 'ilike', `%${search}%`)
              .orWhere('description', 'ilike', `%${search}%`);
        });
      }

      const [{ count }] = await countQuery;
      const total = parseInt(count as string);

      // Aplicar ordenação e paginação
      query = query.orderBy(`r.${sortBy}`, sortOrder)
                   .offset(offset)
                   .limit(limit);

      const rawRoles = await query;

      // Buscar permissões para cada role
      const roles: RoleResponseDto[] = await Promise.all(
        rawRoles.map(async (rawRole) => {
          const permissions = await this.getPermissionsForRole(rawRole.id);
          
          return {
            id: rawRole.id,
            name: rawRole.name,
            description: rawRole.description,
            type: rawRole.type,
            status: rawRole.status,
            user_count: parseInt(rawRole.user_count) || 0,
            permissions,
            created_at: rawRole.created_at,
            updated_at: rawRole.updated_at
          };
        })
      );

      const totalPages = Math.ceil(total / limit);
      
      const result = {
        roles,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
      
      // Armazenar resultado no cache
      try {
        await this.redis.set(cacheKey, JSON.stringify(result), 'EX', TTL.CACHE);
        this.logger.info(`Dados de roles armazenados no cache: ${cacheKey}`);
        
        // Se forem roles ativos, armazenar também em uma chave específica
        if (active === true && !type && !search && sortBy === 'name' && sortOrder === 'asc') {
          const activeRolesKey = 'portal_sabercon:roles:active';
          await this.redis.set(activeRolesKey, JSON.stringify(result), 'EX', TTL.CACHE);
          this.logger.info(`Dados de roles ativos armazenados no cache: ${activeRolesKey}`);
        }
      } catch (error) {
        const cacheError = error as Error;
        this.logger.error(`Erro ao armazenar dados de roles no cache: ${cacheError.message}`, { filters }, cacheError);
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao buscar roles com filtros: ${err.message}`, { filters }, err);
      return {
        success: false,
        error: 'Failed to retrieve roles'
      };
    }
  }

  /**
   * Busca role por ID com detalhes completos
   */
  async findRoleWithDetails(id: string): Promise<ServiceResult<RoleResponseDto>> {
    try {
      const [role] = await db('roles').where({ id });

      if (!role) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      const [{ count }] = await db('User').where({ role_id: id }).count('* as count');
      const permissions = await this.getPermissionsForRole(id);

      const roleDto: RoleResponseDto = {
        id: role.id,
        name: role.name,
        description: role.description,
        type: role.type,
        status: role.status,
        user_count: parseInt(count as string) || 0,
        permissions,
        created_at: role.created_at,
        updated_at: role.updated_at
      };

      return {
        success: true,
        data: roleDto
      };

    } catch (error) {
      this.logger.error('Error finding role with details', error as Error);
      return {
        success: false,
        error: 'Failed to find role'
      };
    }
  }

  /**
   * Busca estatísticas dos roles
   */
  async getStats(): Promise<ServiceResult<RoleStatsDto>> {
    try {
      const [
        totalRolesResult,
        systemRolesResult,
        customRolesResult,
        activeRolesResult,
        inactiveRolesResult,
        totalUsersResult
      ] = await Promise.all([
        db('roles').count('* as count'),
        db('roles').where({ type: 'system' }).count('* as count'),
        db('roles').where({ type: 'custom' }).count('* as count'),
        db('roles').where({ status: 'active' }).count('* as count'),
        db('roles').where({ status: 'inactive' }).count('* as count'),
        db('User').count('* as count')
      ]);

      const stats: RoleStatsDto = {
        totalRoles: parseInt((totalRolesResult[0] as any).count),
        systemRoles: parseInt((systemRolesResult[0] as any).count),
        customRoles: parseInt((customRolesResult[0] as any).count),
        activeRoles: parseInt((activeRolesResult[0] as any).count),
        inactiveRoles: parseInt((inactiveRolesResult[0] as any).count),
        totalUsers: parseInt((totalUsersResult[0] as any).count)
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      this.logger.error('Error getting role stats', error as Error);
      return {
        success: false,
        error: 'Failed to get role statistics'
      };
    }
  }

  /**
   * Busca roles formatados para o frontend refatorado
   */
  async getRolesForFrontend(): Promise<ServiceResult<{ systemRoles: ExtendedRoleDto[], customRoles: CustomRoleDto[] }>> {
    try {
      const rolesResult = await this.findRolesWithFilters({ limit: 1000 });

      if (!rolesResult.success) {
        return {
          success: false,
          error: rolesResult.error
        };
      }

      const roles = rolesResult.data!.roles;
      const systemRoles: ExtendedRoleDto[] = [];
      const customRoles: CustomRoleDto[] = [];

      for (const role of roles) {
        const permissions = this.convertPermissionsToFrontendFormat(role.permissions);

        const baseRole = {
          id: role.id,
          name: role.name,
          description: role.description || '',
          permissions,
          userCount: role.user_count,
          status: role.status,
          createdAt: role.created_at.toISOString(),
          updatedAt: role.updated_at.toISOString()
        };

        if (role.type === 'system') {
          systemRoles.push({
            ...baseRole,
            type: 'system',
            isEditable: false
          });
        } else {
          customRoles.push({
            ...baseRole,
            type: 'custom'
          });
        }
      }

      return {
        success: true,
        data: { systemRoles, customRoles }
      };

    } catch (error) {
      this.logger.error('Error getting roles for frontend', error as Error);
      return {
        success: false,
        error: 'Failed to get roles for frontend'
      };
    }
  }

  /**
   * Busca grupos de permissões para o frontend
   */
  async getPermissionGroups(): Promise<ServiceResult<RolePermissionGroupDto[]>> {
    try {
      return {
        success: true,
        data: this.PERMISSION_GROUPS
      };
    } catch (error) {
      this.logger.error('Error getting permission groups', error as Error);
      return {
        success: false,
        error: 'Failed to get permission groups'
      };
    }
  }

  /**
   * Atualiza role do usuário do MySQL importado para TEACHER
   */
  async assignTeacherRoleToImportedUsers(): Promise<ServiceResult<{ updated: number }>> {
    const trx = await db.transaction();

    try {
      // Buscar role TEACHER
      const [teacherRole] = await trx('roles').where({ name: 'TEACHER' });

      if (!teacherRole) {
        await trx.rollback();
        return {
          success: false,
          error: 'TEACHER role not found'
        };
      }

      // Buscar usuários sem role
      const usersWithoutRole = await trx('User').whereNull('role_id');

      let updatedCount = 0;

      if (usersWithoutRole.length > 0) {
        updatedCount = await trx('User')
          .whereNull('role_id')
          .update({
            role_id: teacherRole.id,
            updated_at: new Date()
          });
      }

      await trx.commit();

      this.logger.info(`Assigned TEACHER role to ${updatedCount} imported users`);

      return {
        success: true,
        data: { updated: updatedCount }
      };

    } catch (error) {
      await trx.rollback();
      this.logger.error('Error assigning teacher role to imported users', error as Error);
      return {
        success: false,
        error: 'Failed to assign teacher role to imported users'
      };
    }
  }

  // Métodos auxiliares privados

  private async getPermissionsForRole(roleId: string): Promise<any[]> {
    try {
      const permissions = await db('permissions as p')
        .select(['p.*'])
        .join('role_permissions as rp', 'rp.permission_id', 'p.id')
        .where('rp.role_id', roleId);

      return permissions.map(p => ({
        id: p.id,
        name: p.name,
        resource: p.resource,
        action: p.action,
        description: p.description
      }));
    } catch (error) {
      this.logger.error(`Error getting permissions for role ${roleId}:`, error as Error);
      // Em caso de erro, retorna array vazio ao invés de propagar o erro
      return [];
    }
  }

  private convertPermissionsToFrontendFormat(permissions: any[]): { [key: string]: boolean } {
    const frontendPermissions: { [key: string]: boolean } = {};

    // Inicializar todas as permissões como false
    Object.values(this.PERMISSION_MAPPING).forEach(frontendKey => {
      frontendPermissions[frontendKey] = false;
    });

    // Marcar como true as permissões que o role possui
    permissions.forEach(permission => {
      const frontendKey = this.PERMISSION_MAPPING[permission.name];
      if (frontendKey) {
        frontendPermissions[frontendKey] = true;
      }
    });

    return frontendPermissions;
  }

  /**
   * Invalida o cache para roles quando ocorrem alterações
   */
  private async invalidateRolesCache(): Promise<void> {
    try {
      // Buscar todas as chaves relacionadas a roles
      const keys = await this.redis.keys('portal_sabercon:roles:*');
      
      if (keys.length > 0) {
        // Deletar todas as chaves
        await this.redis.del(...keys);
        this.logger.info(`Cache de roles invalidado: ${keys.length} chaves removidas`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao invalidar cache de roles: ${err.message}`, null, err);
    }
  }
  
  /**
   * Sobrescreve o método create para invalidar o cache
   */
  async create(data: CreateRoleDto, userId?: string): Promise<ServiceResult<any>> {
    const result = await super.create(data, userId);
    if (result.success) {
      await this.invalidateRolesCache();
    }
    return result;
  }
  
  /**
   * Sobrescreve o método update para invalidar o cache
   */
  async update(id: string, data: UpdateRoleDto, userId?: string): Promise<ServiceResult<any>> {
    const result = await super.update(id, data, userId);
    if (result.success) {
      await this.invalidateRolesCache();
    }
    return result;
  }
  
  /**
   * Sobrescreve o método delete para invalidar o cache
   */
  async delete(id: string, userId?: string): Promise<ServiceResult<any>> {
    const result = await super.delete(id, userId);
    if (result.success) {
      await this.invalidateRolesCache();
    }
    return result;
  }
} 