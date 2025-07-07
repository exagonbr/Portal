export interface Unit {
  id: string;
  name: string;
  institution_id: number;
  institutionName?: string;
  deleted: boolean;
  created_at: Date;
  updated_at: Date;
} 