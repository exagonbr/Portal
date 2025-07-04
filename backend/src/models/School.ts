export interface School {
  id: number;
  version?: number;
  dateCreated?: Date;
  deleted?: boolean;
  institutionId: number;
  lastUpdated?: Date;
  name: string;
  institutionName?: string;
  total_students?: number;
  total_teachers?: number;
  total_classes?: number;
  total_managers?: number;
  active_classes?: number;
}

export interface CreateSchoolData {
  name: string;
  institutionId: number;
}

export interface UpdateSchoolData {
  name?: string;
  institutionId?: number;
  deleted?: boolean;
}