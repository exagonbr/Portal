export class CreateTagDto {
  version?: string;
  deleted?: string;
  name?: string;
}

export class UpdateTagDto {
  version?: string;
  deleted?: string;
  name?: string;
}

export class TagResponseDto {
  id: string;
  version: string;
  dateCreated: string;
  deleted: string;
  lastUpdated: string;
  name: string;
}