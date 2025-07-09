export class CreateGenreDto {
  version?: string;
  apiId?: string;
  name?: string;
}

export class UpdateGenreDto {
  version?: string;
  apiId?: string;
  name?: string;
}

export class GenreResponseDto {
  id: string = "";
  version: string = "";
  apiId: string = "";
  name: string = "";
}