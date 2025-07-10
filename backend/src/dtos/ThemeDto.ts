export class CreateThemeDto {
  version?: string = "";
  apiId?: string = "";
  name?: string = "";
}

export class UpdateThemeDto {
  version?: string = "";
  apiId?: string = "";
  name?: string = "";
}

export class ThemeResponseDto {
  id: string = "";
  version: string = "";
  apiId: string = "";
  name: string = "";
}