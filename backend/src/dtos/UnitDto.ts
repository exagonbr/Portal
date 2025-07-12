export class CreateUnitDto {
  version?: string = "";
  name?: string = "";
  code?: string = "";
  description?: string = "";
  institutionId?: string = "";
  status?: string = "";
}

export class UpdateUnitDto {
  version?: string = "";
  name?: string = "";
  code?: string = "";
  description?: string = "";
  institutionId?: string = "";
  status?: string = "";
}

export class UnitResponseDto {
  id: string = "";
  version: string = "";
  name: string = "";
  code: string = "";
  description: string = "";
  institutionId: string = "";
  status: string = "";
  createdAt: string = "";
  updatedAt: string = "";
}