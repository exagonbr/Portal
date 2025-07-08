export class CreateTargetAudienceDto {
  version?: string;
  apiId?: string;
  name?: string;
}

export class UpdateTargetAudienceDto {
  version?: string;
  apiId?: string;
  name?: string;
}

export class TargetAudienceResponseDto {
  id: string;
  version: string;
  apiId: string;
  name: string;
}