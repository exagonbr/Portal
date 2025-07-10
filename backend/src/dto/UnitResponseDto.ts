export interface UnitResponseDto {
  id: number;
  name: string;
  description?: string;
  institutionId: number;
  type?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}