export class CreateClassesDto {
  name?: string = "";
  code?: string = "";
  description?: string = "";
  year?: string = "";
  semester?: string = "";
  maxStudents?: string = "";
  currentStudents?: string = "";
  unitId?: string = "";
  educationCycleId?: string = "";
  status?: string = "";
}

export class UpdateClassesDto {
  name?: string = "";
  code?: string = "";
  description?: string = "";
  year?: string = "";
  semester?: string = "";
  maxStudents?: string = "";
  currentStudents?: string = "";
  unitId?: string = "";
  educationCycleId?: string = "";
  status?: string = "";
}

export class ClassesResponseDto {
  id: string = "";
  name: string = "";
  code: string = "";
  description: string = "";
  year: string = "";
  semester: string = "";
  maxStudents: string = "";
  currentStudents: string = "";
  unitId: string = "";
  educationCycleId: string = "";
  status: string = "";
  createdAt: string = "";
  updatedAt: string = "";
}