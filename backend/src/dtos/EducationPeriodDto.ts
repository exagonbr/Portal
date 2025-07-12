export class CreateEducationPeriodDto {
  version?: string = "";
  description?: string = "";
  isActive?: string = "";
}

export class UpdateEducationPeriodDto {
  version?: string = "";
  description?: string = "";
  isActive?: string = "";
}

export class EducationPeriodResponseDto {
  id: string = "";
  version: string = "";
  description: string = "";
  isActive: string = "";
}