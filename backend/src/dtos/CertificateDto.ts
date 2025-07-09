export class CreateCertificateDto {
  version?: string;
  path?: string;
  score?: string;
  tvShowId?: string;
  userId?: string;
  document?: string;
  licenseCode?: string;
  tvShowName?: string;
  recreate?: string;
}

export class UpdateCertificateDto {
  version?: string;
  path?: string;
  score?: string;
  tvShowId?: string;
  userId?: string;
  document?: string;
  licenseCode?: string;
  tvShowName?: string;
  recreate?: string;
}

export class CertificateResponseDto {
  id: string = "";
  version: string = "";
  dateCreated: string = "";
  lastUpdated: string = "";
  path: string = "";
  score: string = "";
  tvShowId: string = "";
  userId: string = "";
  document: string = "";
  licenseCode: string = "";
  tvShowName: string = "";
  recreate: string = "";
}