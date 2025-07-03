/**
 * Interface base para entidades do sistema Sabercon
 */
export interface SaberconEntityBase {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
} 