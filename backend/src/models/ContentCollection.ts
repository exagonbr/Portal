export interface ContentCollection {
  id: string;
  name: string;
  synopsis?: string;
  cover_image?: string;
  support_material?: string;
  total_duration?: number;
  subject?: string;
  tags?: string[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContentCollectionData {
  name: string;
  synopsis?: string;
  cover_image?: string;
  support_material?: string;
  total_duration?: number;
  subject?: string;
  tags?: string[];
  created_by?: string;
}

export interface UpdateContentCollectionData {
  name?: string;
  synopsis?: string;
  cover_image?: string;
  support_material?: string;
  total_duration?: number;
  subject?: string;
  tags?: string[];
  created_by?: string;
}

export interface CollectionModule {
  id: string;
  collection_id: string;
  name: string;
  description?: string;
  cover_image?: string;
  video_ids?: string[];
  order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCollectionModuleData {
  collection_id: string;
  name: string;
  description?: string;
  cover_image?: string;
  video_ids?: string[];
  order: number;
}

export interface UpdateCollectionModuleData {
  collection_id?: string;
  name?: string;
  description?: string;
  cover_image?: string;
  video_ids?: string[];
  order?: number;
}
