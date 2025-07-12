export class CreateTeacherSubjectDto {
  version?: string = "";
  deleted?: string = "";
  name?: string = "";
}

export class UpdateTeacherSubjectDto {
  version?: string = "";
  deleted?: string = "";
  name?: string = "";
}

export class TeacherSubjectResponseDto {
  id: string = "";
  version: string = "";
  dateCreated: string = "";
  deleted: string = "";
  lastUpdated: string = "";
  name: string = "";
}