import { Profile } from '../entities/Profile';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { CreateProfileDto, UpdateProfileDto, ProfileResponseDto } from '../dtos/ProfileDto';

export class ProfileService {
  constructor(
    private ProfileRepository: ProfileRepository
  ) {}

  async create(createDto: CreateProfileDto): Promise<ProfileResponseDto> {
    const entity = this.ProfileRepository.create(createDto);
    const saved = await this.ProfileRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ProfileResponseDto[], total: number }> {
    const { data, total } = await this.ProfileRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<ProfileResponseDto | null> {
    const entity = await this.ProfileRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateProfileDto): Promise<ProfileResponseDto | null> {
    await this.ProfileRepository.update(id, updateDto);
    const updated = await this.ProfileRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.ProfileRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.ProfileRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<ProfileResponseDto[]> {
    const entities = await this.ProfileRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Profile): ProfileResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}