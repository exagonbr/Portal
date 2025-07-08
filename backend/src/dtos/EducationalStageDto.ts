export class CreateEducationalStageDto {
  version?: string;
  deleted?: string;
  grade1?: string;
  grade2?: string;
  grade3?: string;
  grade4?: string;
  grade5?: string;
  grade6?: string;
  grade7?: string;
  grade8?: string;
  grade9?: string;
  name?: string;
  uuid?: string;
}

export class UpdateEducationalStageDto {
  version?: string;
  deleted?: string;
  grade1?: string;
  grade2?: string;
  grade3?: string;
  grade4?: string;
  grade5?: string;
  grade6?: string;
  grade7?: string;
  grade8?: string;
  grade9?: string;
  name?: string;
  uuid?: string;
}

export class EducationalStageResponseDto {
  id: string;
  version: string;
  dateCreated: string;
  deleted: string;
  grade1: string;
  grade2: string;
  grade3: string;
  grade4: string;
  grade5: string;
  grade6: string;
  grade7: string;
  grade8: string;
  grade9: string;
  lastUpdated: string;
  name: string;
  uuid: string;
}