import { RolePermissionsService } from '../services/RolePermissionsService';
import { CreateRolePermissionsDto, UpdateRolePermissionsDto, RolePermissionsResponseDto } from '../dtos/RolePermissionsDto';

export class RolePermissionsController {
  constructor(private readonly RolePermissionsService: RolePermissionsService) {}

          async create( createDto: CreateRolePermissionsDto): Promise<RolePermissionsResponseDto> {
    return this.RolePermissionsService.create(createDto);
  }

        async findAll(
     page: number = 1,
     limit: number = 10
  ): Promise<{ data: RolePermissionsResponseDto[], total: number }> {
    return this.RolePermissionsService.findAll(page, limit);
  }

  @Get('search')
      async search( name: string): Promise<RolePermissionsResponseDto[]> {
    return this.RolePermissionsService.search(name);
  }

  @Get(':id')
        async findOne( id: number): Promise<RolePermissionsResponseDto | null> {
    return this.RolePermissionsService.findOne(id);
  }

          async update(
     id: number,
     updateDto: UpdateRolePermissionsDto
  ): Promise<RolePermissionsResponseDto | null> {
    return this.RolePermissionsService.update(id, updateDto);
  }

          async remove( id: number): Promise<{ success: boolean }> {
    const success = await this.RolePermissionsService.remove(id);
    return { success };
  }
}