// Entidade Video refatorada para PostgreSQL
export interface Video {
  id: number;
  version?: number;
  api_id?: string;
  date_created?: Date;
  deleted?: boolean;
  imdb_id?: string;
  intro_end?: number;
  intro_start?: number;
  last_updated?: Date;
  original_language?: string;
  outro_start?: number;
  overview?: string;
  popularity?: number;
  report_count?: number;
  vote_average?: number;
  vote_count?: number;
  class: string; // notNullable na migração
  backdrop_path?: string;
  poster_image_id?: number;
  poster_path?: string;
  release_date?: string;
  title?: string;
  trailer_key?: string;
  backdrop_image_id?: number;
  air_date?: string;
  episode_string?: string;
  episode_number?: number;
  name?: string;
  season_episode_merged?: number;
  season_number?: number;
  show_id?: number;
  still_image_id?: number;
  still_path?: string;
  duration?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVideoData {
  api_id?: string;
  date_created?: Date;
  deleted?: boolean;
  imdb_id?: string;
  intro_end?: number;
  intro_start?: number;
  last_updated?: Date;
  original_language?: string;
  outro_start?: number;
  overview?: string;
  popularity?: number;
  report_count?: number;
  vote_average?: number;
  vote_count?: number;
  class: string;
  backdrop_path?: string;
  poster_image_id?: number;
  poster_path?: string;
  release_date?: string;
  title?: string;
  trailer_key?: string;
  backdrop_image_id?: number;
  air_date?: string;
  episode_string?: string;
  episode_number?: number;
  name?: string;
  season_episode_merged?: number;
  season_number?: number;
  show_id?: number;
  still_image_id?: number;
  still_path?: string;
  duration?: string;
}

export interface UpdateVideoData {
  api_id?: string;
  date_created?: Date;
  deleted?: boolean;
  imdb_id?: string;
  intro_end?: number;
  intro_start?: number;
  last_updated?: Date;
  original_language?: string;
  outro_start?: number;
  overview?: string;
  popularity?: number;
  report_count?: number;
  vote_average?: number;
  vote_count?: number;
  class?: string;
  backdrop_path?: string;
  poster_image_id?: number;
  poster_path?: string;
  release_date?: string;
  title?: string;
  trailer_key?: string;
  backdrop_image_id?: number;
  air_date?: string;
  episode_string?: string;
  episode_number?: number;
  name?: string;
  season_episode_merged?: number;
  season_number?: number;
  show_id?: number;
  still_image_id?: number;
  still_path?: string;
  duration?: string;
}

export interface VideoWithRelations extends Video {
  poster_image?: {
    id: number;
    url: string;
  };
  backdrop_image?: {
    id: number;
    url: string;
  };
  still_image?: {
    id: number;
    url: string;
  };
  show?: {
    id: number;
    title: string;
  };
}