export interface Module {
  id: string;
  name: string;
  description?: string;
  order: number;
  xp_reward: number;
  is_completed: boolean;
  prerequisites?: string[];
  course_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateModuleData {
  name: string;
  description?: string;
  order: number;
  xp_reward?: number;
  is_completed?: boolean;
  prerequisites?: string[];
  course_id: string;
}

export interface UpdateModuleData {
  name?: string;
  description?: string;
  order?: number;
  xp_reward?: number;
  is_completed?: boolean;
  prerequisites?: string[];
  course_id?: string;
}
