export class CreateEducationCyclesDto {
  name?: string = "";
  code?: string = "";
  description?: string = "";
  minAge?: string = "";
  maxAge?: string = "";
  durationYears?: string = "";
  institutionId?: string = "";
  status?: string = "";
}

export class UpdateEducationCyclesDto {
  name?: string = "";
  code?: string = "";
  description?: string = "";
  minAge?: string = "";
  maxAge?: string = "";
  durationYears?: string = "";
  institutionId?: string = "";
  status?: string = "";
}

export class EducationCyclesResponseDto {
  id: string = "";
  name: string = "";
  code: string = "";
  description: string = "";
  minAge: string = "";
  maxAge: string = "";
  durationYears: string = "";
  institutionId: string = "";
  status: string = "";
  createdAt: string = "";
  updatedAt: string = "";
}