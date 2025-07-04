import { BaseEntity } from '../types/common';

export interface CreateFileDto {
  date_created: Date;
  last_updated: Date;
  content_type?: string;
  extension?: string;
  external_link?: string;
  is_default?: boolean;
  is_public?: boolean;
  label?: string;
  local_file?: string;
  name?: string;
  original_filename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitle_label?: string;
  subtitle_src_lang?: string;
  is_subtitled?: boolean;
}

export interface UpdateFileDto {
  last_updated: Date;
  content_type?: string;
  extension?: string;
  external_link?: string;
  is_default?: boolean;
  is_public?: boolean;
  label?: string;
  local_file?: string;
  name?: string;
  original_filename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitle_label?: string;
  subtitle_src_lang?: string;
  is_subtitled?: boolean;
}

export interface FileResponseDto extends BaseEntity {
  id: string;
  version?: number;
  content_type?: string;
  date_created: string;
  extension?: string;
  external_link?: string;
  is_default?: boolean;
  is_public?: boolean;
  label?: string;
  last_updated: string;
  local_file?: string;
  name?: string;
  original_filename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitle_label?: string;
  subtitle_src_lang?: string;
  is_subtitled?: boolean;
}