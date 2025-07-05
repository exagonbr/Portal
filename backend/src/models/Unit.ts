export interface Unit {
  id: number;
  version?: number;
  dateCreated?: Date;
  deleted?: boolean;
  institutionId: number;
  lastUpdated?: Date;
  name: string;
  institutionName?: string;
}

export interface CreateUnitData {
  name: string;
  institutionId: number;
}

export interface UpdateUnitData {
  name?: string;
  deleted?: boolean;
}